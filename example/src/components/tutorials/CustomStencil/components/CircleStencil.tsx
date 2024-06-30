import React, { useImperativeHandle, forwardRef, useRef, useEffect } from 'react';
import {
	StencilProps,
	StencilWrapper,
	StencilOverlay,
	DraggableElement,
	DraggableArea,
	MoveDirections,
	StencilRef,
} from 'react-advanced-cropper';
import './CircleStencil.scss';

export const CircleStencil = forwardRef<StencilRef, StencilProps>(({ cropper }: StencilProps, ref) => {
	const svgWrapperRef = useRef();
	const coordinates = cropper.getStencilCoordinates();
	const transitions = cropper.getTransitions();

	useImperativeHandle(ref, () => ({
		aspectRatio: 1,
	}));

	const onResize = (shift: MoveDirections) => {
		cropper.resizeCoordinates('center', {
			left: shift.left,
			top: shift.left,
		});
	};

	const onMove = (directions: MoveDirections) => {
		cropper.moveCoordinates(directions);
	};

	useEffect(() => {
		fetch('http://127.0.0.1:8080/aixin.svg')
			.then(response => response.text())
			.then(svgText => {
				svgWrapperRef.current.innerHTML = svgText;
				const svgElement = svgWrapperRef.current.querySelector('svg');
				// svgElement.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
				// const mask = document.createElementNS('http://www.w3.org/2000/svg', 'mask');
				// mask.setAttribute('id', 'mask');
				//
				// // 将clipPath元素添加到SVG中
				// svgElement.appendChild(mask);
				//
				// const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
				// rect.setAttribute('width', '100%');
				// rect.setAttribute('height', '100%');
				// rect.setAttribute('fill', 'black');
				// mask.appendChild(rect);

				// 将SVG内部的所有路径元素移到clipPath中
				const tempPaths = svgElement.querySelectorAll('path');
				tempPaths.forEach(path => {
					// mask.appendChild(path);
					svgElement.appendChild(path);
				});

				// Style the SVG to fit the cropper area
				svgElement.style.position = 'absolute';
				svgElement.style.top = '50%';
				svgElement.style.left = '50%';
				svgElement.style.transform = 'translate(-50%, -50%)';
				svgElement.style.width = '100%';
				svgElement.style.height = '100%';
				svgElement.style.pointerEvents = 'none';

				// Remove fill color and keep stroke color
				const paths = svgElement.querySelectorAll('path');
				paths.forEach((path) => {
					path.style.fill = 'white';
					path.style.fillOpacity = 0.1;
					path.style.stroke = 'white'; // Ensure stroke color is set, change as needed
					path.style.strokeWidth = '0.1';
				});
				// const polygons = svgElement.querySelectorAll('polygon');
				// polygons.forEach((polygon) => {
				// 	polygon.style.fill = 'white';
				// 	polygon.style.fillOpacity = 0.1;
				// 	polygon.style.stroke = 'white'; // Ensure stroke color is set, change as needed
				// 	polygon.style.strokeWidth = '0.1';
				// });
			});
	}, []);

	return (
		<StencilWrapper className="circle-stencil" transitions={transitions} {...coordinates}>
			<DraggableArea
				className="circle-stencil__draggable-area"
				onMove={onMove}
				onMoveEnd={cropper.moveCoordinatesEnd}
			>
				<div id="svg-wrapper" ref={svgWrapperRef}></div>
				<div className="overlay"></div>
			</DraggableArea>
		</StencilWrapper>
	);
});

CircleStencil.displayName = 'CircleStencil';
