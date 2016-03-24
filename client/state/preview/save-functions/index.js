import * as actions from './actions';

export function siteTitle( dispatch, customizations, siteId ) {
	const { blogname, blogdescription } = customizations;
	if ( blogname && blogdescription ) {
		dispatch( actions.setSiteSettings( siteId, { blogname, blogdescription } ) );
	}
}

export function headerImage( dispatch, customizations, siteId ) {
	const { headerImagePostId, headerImageUrl, headerImageHeight, headerImageWidth } = customizations;
	if ( headerImagePostId && headerImageUrl && headerImageHeight && headerImageWidth ) {
		return dispatch( actions.setHeaderImage( siteId, headerImageUrl, headerImagePostId, headerImageWidth, headerImageHeight ) );
	}
	dispatch( actions.removeHeaderImage( siteId ) );
}
