/** @format */
/**
 * Internal dependencies
 */
import controller from './controller';

export default function( router ) {
	router( '/jetpack/connect/store', controller.plansLanding );
	router( '/jetpack/connect/store/:interval', controller.plansLanding );

	router(
		'/jetpack/connect/:from(akismet|vaultpress)/:interval(yearly|monthly)?',
		( { params, res } ) =>
			res.redirect( 301, `/jetpack/connect/store${ params.interval ? '/' + params.interval : '' }` )
	);

	// router( '/jetpack/new', controller.newSite );
}
