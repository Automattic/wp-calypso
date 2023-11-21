/**
 * A canvas to use to create text and measure its width.
 * This is needed for the underline width.
 */
const textSizingCanvas = document.createElement( 'canvas' );
textSizingCanvas.width = 2000;
textSizingCanvas.height = 100;
const canvasContext = textSizingCanvas.getContext( '2d' ) as CanvasRenderingContext2D;

/**
 * Gets the font info from an input field then measures the width of the text within.
 * @param text the string
 * @param element The input element
 */
function getTextWidth( text: string, element: HTMLInputElement | undefined ) {
	if ( ! element || ! text ) {
		return 0;
	}
	const computedCSS = window.getComputedStyle( element );

	// FF returns an empty string in font prop.
	canvasContext.font = computedCSS.font || `${ computedCSS.fontSize } ${ computedCSS.fontFamily }`;
	return canvasContext.measureText( text ).width;
}

export default getTextWidth;
