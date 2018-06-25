/** @format */

/**
 * Internal dependencies
 */

import { createReducer } from 'state/utils';
import {
	WOOCOMMERCE_LOCATIONS_REQUEST,
	WOOCOMMERCE_LOCATIONS_REQUEST_SUCCESS,
} from 'woocommerce/state/action-types';
import { LOADING } from 'woocommerce/state/constants';
import { decodeEntities } from 'lib/formatting';

// TODO: Handle error

export default createReducer( null, {
	[ WOOCOMMERCE_LOCATIONS_REQUEST ]: () => {
		return LOADING;
	},

	[ WOOCOMMERCE_LOCATIONS_REQUEST_SUCCESS ]: ( state, { data } ) => {
		return data.map( continent => ( {
			code: continent.code,
			name: decodeEntities( continent.name ),
			countries: continent.countries.map( country => ( {
				code: country.code,
				name: decodeEntities( country.name ),
				states: country.states.map( countryState => ( {
					code: countryState.code,
					name: decodeEntities( countryState.name ),
				} ) ),
			} ) ),
		} ) );
	},
} );
