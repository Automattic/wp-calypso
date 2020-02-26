export function isScheduled( post ) {
	if ( ! post ) {
		return false;
	}

	return post.status === 'future';
}
