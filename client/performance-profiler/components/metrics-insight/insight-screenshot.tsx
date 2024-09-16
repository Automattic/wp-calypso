/**
 * This file is a react port of the Lighthouse element screenshot renderer.
 * The original code is available at https://github.com/GoogleChrome/lighthouse/blob/main/report/renderer/element-screenshot-renderer.js
 *
 * These functions define {Rect}s and {Size}s using two different coordinate spaces:
 *   1. Screenshot coords (SC suffix): where 0,0 is the top left of the screenshot image
 *   2. Display coords (DC suffix): that match the CSS pixel coordinate space of the LH report's page.
 */

const computeZoomFactor = ( elementRectSC, renderContainerSizeDC ) => {
	const targetClipToViewportRatio = 0.75;
	const zoomRatioXY = {
		x: renderContainerSizeDC.width / elementRectSC.width,
		y: renderContainerSizeDC.height / elementRectSC.height,
	};
	const zoomFactor = targetClipToViewportRatio * Math.min( zoomRatioXY.x, zoomRatioXY.y );
	return Math.min( 1, zoomFactor );
};

const clamp = ( value, min, max ) => {
	if ( value < min ) {
		return min;
	}
	if ( value > max ) {
		return max;
	}
	return value;
};

function getElementRectCenterPoint( rect ) {
	return {
		x: rect.left + rect.width / 2,
		y: rect.top + rect.height / 2,
	};
}

const getScreenshotPositions = ( elementRectSC, elementPreviewSizeSC, screenshotSize ) => {
	const elementRectCenter = getElementRectCenterPoint( elementRectSC );

	// Try to center clipped region.
	const screenshotLeftVisibleEdge = clamp(
		elementRectCenter.x - elementPreviewSizeSC.width / 2,
		0,
		screenshotSize.width - elementPreviewSizeSC.width
	);
	const screenshotTopVisisbleEdge = clamp(
		elementRectCenter.y - elementPreviewSizeSC.height / 2,
		0,
		screenshotSize.height - elementPreviewSizeSC.height
	);

	return {
		screenshot: {
			left: screenshotLeftVisibleEdge,
			top: screenshotTopVisisbleEdge,
		},
		clip: {
			left: elementRectSC.left - screenshotLeftVisibleEdge,
			top: elementRectSC.top - screenshotTopVisisbleEdge,
		},
	};
};

const renderClipPathInScreenshot = ( clipId, positionClip, elementRect, elementPreviewSize ) => {
	// Normalize values between 0-1.
	const top = positionClip.top / elementPreviewSize.height;
	const bottom = top + elementRect.height / elementPreviewSize.height;
	const left = positionClip.left / elementPreviewSize.width;
	const right = left + elementRect.width / elementPreviewSize.width;

	const polygonsPoints = [
		`0,0             1,0            1,${ top }          0,${ top }`,
		`0,${ bottom }     1,${ bottom }    1,1               0,1`,
		`0,${ top }        ${ left },${ top } ${ left },${ bottom } 0,${ bottom }`,
		`${ right },${ top } 1,${ top }       1,${ bottom }       ${ right },${ bottom }`,
	];

	return (
		<svg>
			<defs>
				<clipPath clipPathUnits="objectBoundingBox" id={ clipId }>
					{ polygonsPoints.map( ( points, i ) => (
						<polygon key={ i } points={ points } />
					) ) }
				</clipPath>
			</defs>
		</svg>
	);
};

export const NodeScreenshot = ( { nodeId, screenshot, elementRectSC, maxRenderSizeDC } ) => {
	const zoomFactor = computeZoomFactor( elementRectSC, maxRenderSizeDC );

	const elementPreviewSizeSC = {
		width: maxRenderSizeDC.width / zoomFactor,
		height: maxRenderSizeDC.height / zoomFactor,
	};

	elementPreviewSizeSC.width = Math.min( screenshot.width, elementPreviewSizeSC.width );
	elementPreviewSizeSC.height = Math.min( screenshot.height, elementPreviewSizeSC.height );

	/* This preview size is either the size of the thumbnail or size of the Lightbox */
	const elementPreviewSizeDC = {
		width: elementPreviewSizeSC.width * zoomFactor,
		height: elementPreviewSizeSC.height * zoomFactor,
	};

	const positions = getScreenshotPositions( elementRectSC, elementPreviewSizeSC, {
		width: screenshot.width,
		height: screenshot.height,
	} );

	return (
		<>
			<div className="element-screenshot">
				<div
					className="element-screenshot__image"
					style={ {
						backgroundImage: `url(${ screenshot.data })`,
						width: elementPreviewSizeDC.width + 'px',
						height: elementPreviewSizeDC.height + 'px',
						backgroundPositionY: -( positions.screenshot.top * zoomFactor ) + 'px',
						backgroundPositionX: -( positions.screenshot.left * zoomFactor ) + 'px',
						backgroundSize: `${ screenshot.width * zoomFactor }px ${
							screenshot.height * zoomFactor
						}px`,
					} }
				>
					<div
						className="element-screenshot__mask"
						style={ {
							width: elementPreviewSizeDC.width + 'px',
							height: elementPreviewSizeDC.height + 'px',
							clipPath: `url(#${ nodeId })`,
						} }
					>
						{ renderClipPathInScreenshot(
							nodeId,
							positions.clip,
							elementRectSC,
							elementPreviewSizeSC
						) }
					</div>
					<div
						className="element-screenshot__element-marker"
						style={ {
							width: elementRectSC.width * zoomFactor + 'px',
							height: elementRectSC.height * zoomFactor + 'px',
							left: positions.clip.left * zoomFactor + 'px',
							top: positions.clip.top * zoomFactor + 'px',
						} }
					></div>
				</div>
			</div>
		</>
	);
};
