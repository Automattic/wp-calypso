export function imageSizeFromAttachments( post, imageUrl ) {
	if ( ! post.attachments ) {
		return;
	}

	const found = Object.values( post.attachments ).find(
		( attachment ) => attachment.URL === imageUrl
	);

	if ( found ) {
		return {
			width: found.width,
			height: found.height,
		};
	}
}
