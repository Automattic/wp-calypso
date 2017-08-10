/** @format */
/**
 * Internal dependencies
 */
import request from '../request';
import { setError } from '../status/wc-api/actions';
import {
	WOOCOMMERCE_LOCATIONS_REQUEST,
	WOOCOMMERCE_LOCATIONS_REQUEST_SUCCESS,
} from 'woocommerce/state/action-types';
import { areLocationsLoaded, areLocationsLoading } from './selectors';

export const fetchLocations = siteId => ( dispatch, getState ) => {
	if ( areLocationsLoaded( getState(), siteId ) || areLocationsLoading( getState(), siteId ) ) {
		return;
	}

	const getAction = {
		type: WOOCOMMERCE_LOCATIONS_REQUEST,
		siteId,
	};

	dispatch( getAction );

	return request( siteId )
		.get( 'data/continents' )
		.then( data => {
			dispatch( {
				type: WOOCOMMERCE_LOCATIONS_REQUEST_SUCCESS,
				siteId,
				data,
			} );
		} )
		.catch( err => {
			dispatch( setError( siteId, getAction, err ) );
		} );
};
