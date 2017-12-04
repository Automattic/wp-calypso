/** @format */
/**
 * Internal dependencies
 */
import controller from './controller';
import { makeLayout } from 'controller';

export default function( router ) {
	router(
		'/jetpack/connect/store/:interval(monthly|yearly)?',
		controller.plansLanding,
		makeLayout
	);

	router(
		'/jetpack/connect/:from(akismet|vaultpress)/:interval(yearly|monthly)?',
		( { params, res } ) =>
			res.redirect( 301, `/jetpack/connect/store${ params.interval ? '/' + params.interval : '' }` )
	);

	// router( '/jetpack/new', controller.newSite );
}
