import get from 'lodash/get';

export const getTitleFormats = ( siteId, state ) =>
	get( state, [ 'sites', 'seo', 'titleFormats', siteId ], {} );
