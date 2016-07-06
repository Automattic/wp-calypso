/**
 * External dependencies
 */
import debugFactory from 'debug';
import wpcom from 'lib/wp';

/**
 * Internal dependencies
 */
import * as ActionTypes from 'state/action-types';

const debug = debugFactory( 'calypso:preivew-actions' );

export function fetchPreviewMarkup( site, slug, customizations ) {
	return function( dispatch ) {
		const postData = {};
		if ( customizations ) {
			if ( customizations.homePage && customizations.homePage.hasOwnProperty( 'isPageOnFront' ) ) {
				postData.show_on_front = customizations.homePage.isPageOnFront ? 'page' : 'posts';
				if ( customizations.homePage.pageOnFrontId ) {
					postData.page_on_front = customizations.homePage.pageOnFrontId;
				}
				if ( customizations.homePage.pageForPostsId ) {
					postData.page_for_posts = customizations.homePage.pageForPostsId;
				}
			}
		}
		debug( 'fetching preview markup', site, slug, customizations, 'postData', postData );
		wpcom.undocumented().fetchPreviewMarkup( site, slug, postData )
		.then( markup => dispatch( gotMarkup( site, markup ) ) );
		// TODO: handle errors
	};
}

export function gotMarkup( siteId, markup ) {
	return { type: ActionTypes.PREVIEW_MARKUP_RECEIVE, markup, siteId };
}

export function clearCustomizations( siteId ) {
	return { type: ActionTypes.PREVIEW_CUSTOMIZATIONS_CLEAR, siteId };
}

export function updateCustomizations( siteId, customizations ) {
	return { type: ActionTypes.PREVIEW_CUSTOMIZATIONS_UPDATE, customizations, siteId };
}

export function undoCustomization( siteId ) {
	return { type: ActionTypes.PREVIEW_CUSTOMIZATIONS_UNDO, siteId };
}

export function customizationsSaved( siteId ) {
	return { type: ActionTypes.PREVIEW_CUSTOMIZATIONS_SAVED, siteId };
}
