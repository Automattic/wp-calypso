export function isPrivate( post ) {
	if ( ! post ) {
		return false;
	}

	return post.status === 'private';
}
