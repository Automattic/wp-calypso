/**
 * Internal dependencies
 */
import request from '../request';
import { setError } from '../status/wc-api/actions';
import { areCurrenciesLoaded, areCurrenciesLoading } from './selectors';
import { WOOCOMMERCE_CURRENCIES_REQUEST, WOOCOMMERCE_CURRENCIES_REQUEST_SUCCESS } from 'woocommerce/state/action-types';

export const fetchCurrencies = ( siteId ) => ( dispatch, getState ) => {
	if ( areCurrenciesLoaded( getState(), siteId ) || areCurrenciesLoading( getState(), siteId ) ) {
		return;
	}

	const getAction = {
		type: WOOCOMMERCE_CURRENCIES_REQUEST,
		siteId,
	};

	dispatch( getAction );

	return request( siteId ).get( 'data/currencies' )
		.then( ( data ) => {
			dispatch( {
				type: WOOCOMMERCE_CURRENCIES_REQUEST_SUCCESS,
				siteId,
				data,
			} );
		} )
		.catch( err => {
			dispatch( setError( siteId, getAction, err ) );
		} );
};
