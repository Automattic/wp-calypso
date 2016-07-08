const getFlowType = function( state, site ) {
	const siteSlug = site.slug.replace( /.*?:\/\//g, '' );
	if ( state && state[ siteSlug ] ) {
		return state[ siteSlug ].flowType;
	}
	return false;
};

export default { getFlowType };
