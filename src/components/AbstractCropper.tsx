import React, { useImperativeHandle, useRef, CSSProperties, Ref, useState } from 'react';
import cn from 'classnames';
import {
	DrawOptions,
	BoundaryStretchAlgorithm,
	DefaultSettings,
	defaultStencilConstraints,
	BoundarySizeAlgorithm,
	CoreSettings,
	CropperImage,
	CropperState,
	CropperTransitions,
	ModifierSettings,
} from 'advanced-cropper';

import {
	CropperBackgroundWrapperComponent,
	CropperWrapperComponent,
	StencilComponent,
	CropperBackgroundComponent,
	ArbitraryProps,
	StencilConstraints,
	SettingsExtension,
	ExtendedSettings,
	CustomCropperRef,
} from '../types';
import { CropperStateHook, CropperStateSettings, CropperStateSettingsProp } from '../hooks/useCropperState';
import { createCropper } from '../service/cropper';
import { AbstractCropperHookProps, useAbstractCropper } from '../hooks/useAbstractCropper';
import { StretchableBoundary } from './service/StretchableBoundary';
import { CropperWrapper } from './service/CropperWrapper';
import { CropperBackgroundImage } from './service/CropperBackgroundImage';
import { CropperCanvas } from './service/CropperCanvas';
import { RectangleStencil } from './stencils/RectangleStencil';
import { CropperBackgroundWrapper } from './service/CropperBackgroundWrapper';

export type AbstractCropperSettingsProp<Settings extends CropperStateSettings> = CropperStateSettingsProp<Settings>;

export type AbstractCropperSettings = DefaultSettings & CoreSettings & ModifierSettings;

export interface AbstractCropperRef<Settings extends AbstractCropperSettings = AbstractCropperSettings> {
	reset: () => void;
	refresh: () => void;
	setCoordinates: CropperStateHook['setCoordinates'];
	setState: CropperStateHook['setState'];
	setImage: (image: CropperImage) => void;
	flipImage: CropperStateHook['flipImage'];
	zoomImage: CropperStateHook['zoomImage'];
	rotateImage: CropperStateHook['rotateImage'];
	reconcileState: CropperStateHook['reconcileState'];
	moveImage: CropperStateHook['moveImage'];
	moveCoordinates: CropperStateHook['moveCoordinates'];
	moveCoordinatesEnd: CropperStateHook['moveCoordinatesEnd'];
	resizeCoordinates: CropperStateHook['resizeCoordinates'];
	resizeCoordinatesEnd: CropperStateHook['resizeCoordinatesEnd'];
	transformImage: CropperStateHook['transformImage'];
	transformImageEnd: CropperStateHook['transformImageEnd'];
	getCoordinates: CropperStateHook['getCoordinates'];
	getVisibleArea: CropperStateHook['getVisibleArea'];
	getTransforms: CropperStateHook['getTransforms'];
	getStencilCoordinates: CropperStateHook['getStencilCoordinates'];
	getDefaultState: () => CropperState | null;
	getCanvas: (options?: DrawOptions) => HTMLCanvasElement | null;
	getSettings: () => Settings;
	getImage: () => CropperImage | null;
	getState: () => CropperState | null;
	getTransitions: () => CropperTransitions;
}

export interface AbstractCropperProps<Settings extends AbstractCropperSettings>
	extends Omit<AbstractCropperHookProps<Settings>, 'settings'> {
	backgroundComponent?: CropperBackgroundComponent;
	backgroundProps?: ArbitraryProps;
	backgroundWrapperComponent?: CropperBackgroundWrapperComponent;
	backgroundWrapperProps?: ArbitraryProps;
	wrapperComponent?: CropperWrapperComponent;
	wrapperProps?: ArbitraryProps;
	stencilComponent?: StencilComponent;
	stencilProps?: ArbitraryProps;
	stencilConstraints?: StencilConstraints<AbstractCropperSettingsProp<Settings>>;
	className?: string;
	imageClassName?: string;
	boundaryClassName?: string;
	backgroundClassName?: string;
	boundaryStretchAlgorithm?: BoundaryStretchAlgorithm;
	boundarySizeAlgorithm?: BoundarySizeAlgorithm;
	style?: CSSProperties;
	settings: CropperStateSettingsProp<Settings>;
}

export type AbstractCropperIntrinsicProps<Settings extends AbstractCropperSettings> = Omit<
	AbstractCropperProps<Settings>,
	'settings'
>;

const AbstractCropperComponent = <Extension extends SettingsExtension = {}>(
	props: AbstractCropperProps<ExtendedSettings<Extension>>,
	ref: Ref<CustomCropperRef<Extension>>,
) => {
	const {
		style,
		className,
		stencilComponent = RectangleStencil,
		stencilConstraints = defaultStencilConstraints,
		stencilProps = {},
		wrapperComponent = CropperWrapper,
		wrapperProps = {},
		backgroundComponent = CropperBackgroundImage,
		backgroundProps = {},
		backgroundClassName,
		backgroundWrapperComponent = CropperBackgroundWrapper,
		backgroundWrapperProps = {},
		imageClassName,
		boundaryClassName,
		boundarySizeAlgorithm,
		boundaryStretchAlgorithm,
		canvas = true,
		crossOrigin = true,
		settings,
		...parameters
	} = props;

	const stencilRef = useRef<StencilComponent>(null);

	const { cropper, image, loaded, loading, refs } = useAbstractCropper(() => ({
		...parameters,
		crossOrigin,
		stencilProps,
		canvas,
		settings: {
			...settings,
			...stencilConstraints(settings, {
				...stencilProps,
				...stencilRef.current,
			}),
		},
	}));

	const StencilComponent = stencilComponent;

	const WrapperComponent = wrapperComponent;

	const BackgroundWrapperComponent = backgroundWrapperComponent;

	const BackgroundComponent = backgroundComponent;

	useImperativeHandle(ref, () => cropper);

	return (
		<WrapperComponent
			{...wrapperProps}
			className={cn('advanced-cropper', className)}
			loaded={loaded}
			cropper={cropper}
			loading={loading}
			style={style}
		>
			<StretchableBoundary
				ref={refs.boundary}
				stretchAlgorithm={boundaryStretchAlgorithm}
				sizeAlgorithm={boundarySizeAlgorithm}
				className={cn('advanced-cropper__boundary', boundaryClassName)}
				stretcherClassName={cn('advanced-cropper__stretcher')}
			>
				<BackgroundWrapperComponent
					{...backgroundWrapperProps}
					cropper={cropper}
					className={'advanced-cropper__background-wrapper'}
				>
					<div className={cn('advanced-cropper__background', backgroundClassName)}>
						{cropper.getState() && (
							<BackgroundComponent
								{...backgroundProps}
								ref={refs.image}
								crossOrigin={crossOrigin}
								cropper={cropper}
								className={cn('advanced-cropper__image', imageClassName)}
							/>
						)}
					</div>
					<StencilComponent {...stencilProps} ref={stencilRef} cropper={cropper} image={image} />
				</BackgroundWrapperComponent>
				{canvas && <CropperCanvas ref={refs.canvas} />}
			</StretchableBoundary>
		</WrapperComponent>
	);
};

export const AbstractCropper = createCropper(AbstractCropperComponent);
