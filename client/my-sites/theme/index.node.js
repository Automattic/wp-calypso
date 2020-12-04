/**
 * Internal dependencies
 */

import config from 'calypso/config';
import { makeLayout } from 'calypso/controller';
import { details, fetchThemeDetailsData, notFoundError } from './controller';

export default function ( router ) {
	if ( config.isEnabled( 'manage/themes/details' ) ) {
		router( '/theme', ( { res } ) => res.redirect( '/themes' ) );
		router(
			'/theme/:slug/:section(setup|support)?/:site_id?',
			fetchThemeDetailsData,
			details,
			makeLayout,

			// Error handlers
			notFoundError
		);
	}
}
