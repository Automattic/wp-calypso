/**
 * Internal dependencies
 */

import { areTaxRatesLoaded, areTaxRatesLoading } from './selectors';
import { setError } from '../../status/wc-api/actions';
import {
	WOOCOMMERCE_TAXRATES_REQUEST,
	WOOCOMMERCE_TAXRATES_REQUEST_SUCCESS,
} from 'woocommerce/state/action-types';
import wp from 'lib/wp';

export const fetchTaxRates = ( siteId, address, forceReload = false ) => ( dispatch, getState ) => {
	if ( areTaxRatesLoading( getState(), siteId ) ) {
		return;
	}

	if ( false === forceReload && areTaxRatesLoaded( getState(), siteId ) ) {
		return;
	}

	const getAction = {
		type: WOOCOMMERCE_TAXRATES_REQUEST,
		siteId,
	};

	dispatch( getAction );

	return wp.req
		.get( { path: `/sites/${ siteId }/tax-rates` }, { ...address } )
		.then( ( data ) => {
			dispatch( {
				type: WOOCOMMERCE_TAXRATES_REQUEST_SUCCESS,
				siteId,
				data,
			} );
		} )
		.catch( ( err ) => {
			dispatch( setError( siteId, getAction, err ) );
		} );
};
