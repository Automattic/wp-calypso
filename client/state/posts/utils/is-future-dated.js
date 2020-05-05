export function isFutureDated( post ) {
	if ( ! post ) {
		return false;
	}

	const oneMinute = 1000 * 60;

	return post && +new Date() + oneMinute < +new Date( post.date );
}
