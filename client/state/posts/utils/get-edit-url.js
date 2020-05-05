export function getEditURL( post, site ) {
	if ( ! site ) {
		return '/post';
	}

	if ( ! post ) {
		return `/post/${ site.slug }`;
	}

	let path;

	const type = post.type || 'post';
	switch ( type ) {
		case 'post':
			path = '/post';
			break;
		case 'page':
			path = '/page';
			break;
		default:
			path = `/edit/${ type }`;
			break;
	}

	path += `/${ site.slug }`;

	if ( post.ID ) {
		path += `/${ post.ID }`;
	}

	return path;
}
