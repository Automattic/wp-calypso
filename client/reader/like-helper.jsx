export function shouldShowLikes( post ) {
	if ( post && post.site_ID && ! post.is_external ) {
		return true;
	}

	return false;
}
