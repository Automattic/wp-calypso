export function isPage( post ) {
	if ( ! post ) {
		return false;
	}

	return post && 'page' === post.type;
}
