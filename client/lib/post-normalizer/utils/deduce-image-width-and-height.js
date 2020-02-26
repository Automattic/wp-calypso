export function deduceImageWidthAndHeight( image ) {
	if ( image.height && image.width ) {
		return {
			height: image.height,
			width: image.width,
		};
	}
	if ( image.naturalHeight && image.naturalWidth ) {
		return {
			height: image.naturalHeight,
			width: image.naturalWidth,
		};
	}
	if ( image.dataset && image.dataset.origSize ) {
		const [ width, height ] = image.dataset.origSize.split( ',' ).map( Number );
		return {
			width,
			height,
		};
	}
	return null;
}
