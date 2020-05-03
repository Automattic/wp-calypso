export function isPending( post ) {
	if ( ! post ) {
		return false;
	}

	return post.status === 'pending';
}
