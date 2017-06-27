/**
 * Internal dependencies
 */
import {
	areTaxRatesLoaded,
	areTaxRatesLoading,
} from './selectors';
import { setError } from '../../status/wc-api/actions';
import {
	TAXRATES_REQUEST,
	TAXRATES_REQUEST_SUCCESS,
} from 'woocommerce/state/action-types';
import wp from 'lib/wp';

export const fetchTaxRates = ( siteId ) => ( dispatch, getState ) => {
	if (
		areTaxRatesLoaded( getState(), siteId ) ||
		areTaxRatesLoading( getState(), siteId )
	) {
		return;
	}

	const getAction = {
		type: TAXRATES_REQUEST,
		siteId,
	};

	dispatch( getAction );

	return wp.req.get( { path: `/sites/${ siteId }/tax-rates` } )
		.then( ( data ) => {
			dispatch( {
				type: TAXRATES_REQUEST_SUCCESS,
				siteId,
				data,
			} );
		} )
		.catch( err => {
			dispatch( setError( siteId, getAction, err ) );
		} );
};
