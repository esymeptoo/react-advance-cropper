import React, { useState, useRef, useEffect } from 'react';
import { Cropper } from 'react-advanced-cropper';
import { CircleStencil } from './components/CircleStencil';
import '../../examples/ChangingStencilExample.scss';

export const CustomStencil = () => {
	const cropperRef = useRef();
	const [imgData, setImgData] = useState('');
	const [image] = useState('/react-advanced-cropper/img/images/pexels-photo-1451124.jpeg');

	const handleCrop = () => {
		const canvas = cropperRef.current.getCanvas();
		const ctx = canvas.getContext('2d');
		const svgElement = document.querySelector('#svg-wrapper svg').cloneNode(true);
		svgElement.style.backgroundColor = '';
		const paths = svgElement.querySelectorAll('path');
		paths.forEach(path => {
			path.style.fill = 'gray';
			path.style.fillOpacity = 1;
		});
		const svgString = new XMLSerializer().serializeToString(svgElement);
		const img = new Image();
		const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
		const url = URL.createObjectURL(svgBlob);
		img.onload = () => {
			// Create a temporary canvas to draw the SVG and get the clipping path
			const tempCanvas = document.createElement('canvas');
			tempCanvas.width = canvas.width;
			tempCanvas.height = canvas.height;
			const tempCtx = tempCanvas.getContext('2d');
			tempCtx.drawImage(img, 0, 0, canvas.width, canvas.height);

			// Create clipping path
			ctx.globalCompositeOperation = 'destination-in';
			ctx.drawImage(tempCanvas, 0, 0);

			setImgData(canvas.toDataURL());

			// Cleanup
			URL.revokeObjectURL(url);
		};
		img.src = url;
	}

	return (
		<div>
			<Cropper
				ref={cropperRef}
				className={'custom-stencil-example'}
				stencilComponent={CircleStencil}
				src={image}
			/>
			<button onClick={handleCrop}>crop</button>
			{
				imgData && (
					<img src={imgData} alt=""/>
				)
			}
		</div>
	);
};
