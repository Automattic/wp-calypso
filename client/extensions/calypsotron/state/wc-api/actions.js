
/**
 * External dependencies
 */
import wp from 'lib/wp';

/**
 * Internal dependencies
 */
import WCApi from '../../lib/wc-api';

export const fetchProductCategories = ( siteId ) => {
	return () => {
		const wcApi = new WCApi( wp );

		return wcApi.fetchProductCategories( siteId )
			.then( ( response ) => {
				// TODO: Capture this data and provide it to the UI components.
				console.log( 'fetchProductCategories response:' );
				console.log( response );
			} ).catch( ( error ) => {
				// TODO: Capture error data for the main plugin status.
				console.log( 'fetchProductCategories error:' );
				console.log( error.message );
			} );
	};
};
