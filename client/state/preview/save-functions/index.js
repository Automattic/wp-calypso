import * as actions from './actions';

export function siteTitle( dispatch, customizations, siteId ) {
	const { blogname, blogdescription } = customizations;
	if ( blogname && blogdescription ) {
		dispatch( actions.setSiteSettings( siteId, { blogname, blogdescription } ) );
	}
}
