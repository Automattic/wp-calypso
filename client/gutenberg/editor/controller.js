/** @format */
/**
 * External dependencies
 */
import React from 'react';
import page from 'page';

/**
 * WordPress dependencies
 */
import CalypsoifyIframe from './calypsoify-iframe';

/**
 * Internal dependencies
 */
import isCalypsoifyGutenbergEnabled from 'state/selectors/is-calypsoify-gutenberg-enabled';
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';

export const redirect = ( { store: { getState } }, next ) => {
	const state = getState();
	const siteId = getSelectedSiteId( state );
	const hasGutenberg = isCalypsoifyGutenbergEnabled( state, siteId );

	if ( hasGutenberg ) {
		return next();
	}

	return page.redirect( `/post/${ getSelectedSiteSlug( state ) }` );
};

export const post = async ( context, next ) => {
	//see post-editor/controller.js for reference
	context.primary = <CalypsoifyIframe />;

	next();
};
