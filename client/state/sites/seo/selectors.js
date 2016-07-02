import get from 'lodash/get';

export const getTitleFormats = ( state, siteId ) =>
	get( state, [ 'sites', 'seo', 'titleFormats', siteId ], {} );
