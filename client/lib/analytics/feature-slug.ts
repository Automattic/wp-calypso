export function getFeatureSlugFromPageUrl( pageUrl: string = '' ) {
	let featureSlug =
		pageUrl === '/' ? 'homepage' : pageUrl.replace( /^\//, '' ).replace( /\.|\/|:/g, '_' );
	let matched;
	// prevent explosion of read list metrics
	// this is a hack - ultimately we want to report this URLs in a more generic way to
	// google analytics
	if ( featureSlug.startsWith( 'read_list' ) ) {
		featureSlug = 'read_list';
	} else if ( featureSlug.startsWith( 'tag_' ) ) {
		featureSlug = 'tag__id';
	} else if ( featureSlug.startsWith( 'domains_add_suggestion_' ) ) {
		featureSlug = 'domains_add_suggestion__suggestion__domain';
	} else if ( featureSlug.match( /^plugins_[^_].*__/ ) ) {
		featureSlug = 'plugins__site__plugin';
	} else if ( featureSlug.match( /^plugins_[^_]/ ) ) {
		featureSlug = 'plugins__site__unknown'; // fail safe because there seems to be some URLs we're not catching
	} else if ( featureSlug.startsWith( 'read_post_feed_' ) ) {
		featureSlug = 'read_post_feed__id';
	} else if ( featureSlug.startsWith( 'read_post_id_' ) ) {
		featureSlug = 'read_post_id__id';
	} else if ( ( matched = featureSlug.match( /^start_(.*)_(..)$/ ) ) != null ) {
		featureSlug = `start_${ matched[ 1 ] }`;
	} else if ( featureSlug.startsWith( 'page__' ) ) {
		// Fold post editor routes for page, post and CPT into one generic 'post__*' one
		featureSlug = featureSlug.replace( /^page__/, 'post__' );
	} else if ( featureSlug.startsWith( 'edit_' ) ) {
		// use non-greedy +? operator to match the custom post type slug
		featureSlug = featureSlug.replace( /^edit_.+?__/, 'post__' );
	}

	return featureSlug;
}
