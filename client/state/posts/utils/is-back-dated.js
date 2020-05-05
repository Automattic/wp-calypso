export function isBackDated( post ) {
	if ( ! post || ! post.date || ! post.modified ) {
		return false;
	}

	return new Date( post.date ) < new Date( post.modified );
}
