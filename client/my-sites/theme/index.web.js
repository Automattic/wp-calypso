/**
 * Internal dependencies
 */

import config from 'calypso/config';
import { makeLayout, redirectLoggedOut } from 'calypso/controller';
import { details, fetchThemeDetailsData } from './controller';
import { siteSelection } from 'calypso/my-sites/controller';

function redirectToLoginIfSiteRequested( context, next ) {
	if ( context.params.site_id ) {
		redirectLoggedOut( context, next );
		return;
	}

	next();
}

export default function ( router ) {
	if ( config.isEnabled( 'manage/themes/details' ) ) {
		router(
			'/theme/:slug/:section(setup|support)?/:site_id?',
			redirectToLoginIfSiteRequested,
			siteSelection,
			fetchThemeDetailsData,
			details,
			makeLayout
		);
	}
}
