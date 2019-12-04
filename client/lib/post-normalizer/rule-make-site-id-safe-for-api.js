export default function makeSiteIDSafeForAPI( post ) {
	if ( post.site_id ) {
		post.normalized_site_id = ( '' + post.site_id ).replace( /::/g, '/' );
	}

	return post;
}
