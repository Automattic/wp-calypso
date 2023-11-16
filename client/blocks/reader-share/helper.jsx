export function shouldShowShare( post ) {
	return ! post.site_is_private;
}

export function shouldShowReblog( post, hasSites ) {
	return hasSites && ! post.site_is_private;
}
