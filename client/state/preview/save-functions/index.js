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

export function siteLogo( dispatch, customizations, siteId ) {
	const { logoPostId, logoUrl } = customizations;
	if ( logoPostId && logoUrl ) {
		return dispatch( actions.setSiteLogo( siteId, logoPostId, logoUrl ) );
	}
	dispatch( actions.removeSiteLogo( siteId ) );
}

export function homepage( dispatch, customizations, siteId ) {
	const { isPageOnFront, pageOnFrontId, pageForPostsId } = customizations;
	dispatch( actions.setHomepageSettings( siteId, isPageOnFront, pageOnFrontId, pageForPostsId ) );
}
