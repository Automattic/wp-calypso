import debugFactory from 'debug';
import i18n from 'i18n-calypso';
import wpcom from 'calypso/lib/wp';
import {
	JETPACK_SITES_FEATURES_FETCH,
	JETPACK_SITES_FEATURES_FETCH_FAILURE,
	JETPACK_SITES_FEATURES_FETCH_SUCCESS,
	JETPACK_SITES_FEATURES_RECEIVE,
	SITE_FEATURES_FETCH,
	SITE_FEATURES_FETCH_COMPLETED,
	SITE_FEATURES_FETCH_FAILED,
} from 'calypso/state/action-types';
import { createSiteFeaturesObject } from './assembler';

const debug = debugFactory( 'calypso:site-features:actions' );

/**
 * Fetches features for the given site.
 *
 * @param {number} siteId identifier of the site
 * @returns {Function} a promise that will resolve once fetching is completed
 */
export function fetchSiteFeatures( siteId ) {
	return ( dispatch ) => {
		dispatch( {
			type: SITE_FEATURES_FETCH,
			siteId,
		} );

		return wpcom.req
			.get( `/sites/${ siteId }/features` )
			.then( ( data ) => {
				dispatch( fetchSiteFeaturesCompleted( siteId, data ) );
			} )
			.catch( ( error ) => {
				debug( 'Fetching site features failed: ', error );

				const errorMessage =
					error.message ||
					i18n.translate(
						'There was a problem fetching site features. Please try again later or contact support.'
					);

				dispatch( {
					type: SITE_FEATURES_FETCH_FAILED,
					siteId,
					error: errorMessage,
				} );
			} );
	};
}

export function fetchJetpackSitesFeatures() {
	return ( dispatch ) => {
		dispatch( {
			type: JETPACK_SITES_FEATURES_FETCH,
		} );

		return wpcom.req
			.get( '/me/sites/features' )
			.then( ( data ) => {
				const features = {};
				for ( const siteId in data.features ) {
					features[ siteId ] = createSiteFeaturesObject( data.features[ siteId ] );
				}

				dispatch( fetchJetpackSitesFeaturesReceive( features ) );

				dispatch( {
					type: JETPACK_SITES_FEATURES_FETCH_SUCCESS,
				} );
			} )
			.catch( ( error ) => {
				const errorMessage =
					error.message ||
					i18n.translate(
						'There was a problem fetching site features. Please try again later or contact support.'
					);
				dispatch( {
					type: JETPACK_SITES_FEATURES_FETCH_FAILURE,
					error: errorMessage,
				} );
			} );
	};
}

function fetchJetpackSitesFeaturesReceive( features ) {
	return { type: JETPACK_SITES_FEATURES_RECEIVE, features };
}

/**
 * Returns an action object to be used in signalling that an object containing
 * the features for a given site have been received.
 *
 * @param {number} siteId - identifier of the site
 * @param {Object} features - list of features received from the API
 * @returns {Object} the corresponding action object
 */
export function fetchSiteFeaturesCompleted( siteId, features ) {
	return {
		type: SITE_FEATURES_FETCH_COMPLETED,
		siteId,
		features: createSiteFeaturesObject( features ),
	};
}
