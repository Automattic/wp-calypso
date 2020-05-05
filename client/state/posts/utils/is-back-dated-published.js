// Return backdated-published status of a post. Optionally, the `status` can be overridden
// with a custom value: what would the post status be if a `status` edit was applied?
export function isBackDatedPublished( post, status ) {
	if ( ! post ) {
		return false;
	}

	const effectiveStatus = status || post.status;

	return effectiveStatus === 'future' && new Date( post.date ) < Date.now();
}
