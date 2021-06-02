/**
 * Internal dependencies
 */
import { makeLayout } from 'calypso/controller';
import { details, fetchThemeDetailsData, notFoundError } from './controller';

export default function ( router ) {
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
