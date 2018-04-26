/** @format */

/**
 * External dependencies
 */
import React from 'react';
import page from 'page';

/**
 * Internal Dependencies
 */
import GoogleMyBusinessNewAccount from './new-account';
import GoogleMyBusinessSelectBusinessType from './select-business-type';
import GoogleMyBusinessSelectLocation from './select-location';
import GoogleMyBusinessStats from './stats';

import { getSelectedSiteId } from 'state/ui/selectors';
import { isGoogleMyBusinessLocationConnected } from 'state/selectors';
import { requestSiteSettings } from 'state/site-settings/actions';

export const redirectToStatsIfLocationConnected = ( context, next ) => {
	const siteId = getSelectedSiteId( context.store.getState() );
	context.store
		.dispatch( requestSiteSettings( siteId ) )
		.then( () => {
			if ( isGoogleMyBusinessLocationConnected( context.store.getState(), siteId ) ) {
				page.redirect( `/google-my-business/stats/${ context.params.site }` );
			} else {
				next();
			}
		} )
		.catch( next ); // on error, try to move forward
};

export function newAccount( context, next ) {
	context.primary = <GoogleMyBusinessNewAccount />;

	next();
}

export function selectBusinessType( context, next ) {
	context.primary = <GoogleMyBusinessSelectBusinessType />;

	next();
}

export function selectLocation( context, next ) {
	context.primary = <GoogleMyBusinessSelectLocation />;

	next();
}

export function stats( context, next ) {
	context.primary = <GoogleMyBusinessStats />;

	next();
}
