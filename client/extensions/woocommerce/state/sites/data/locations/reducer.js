/** @format */

/**
 * Internal dependencies
 */

import { createReducer } from 'state/utils';
import {
	WOOCOMMERCE_LOCATIONS_REQUEST,
	WOOCOMMERCE_LOCATIONS_REQUEST_SUCCESS,
	WOOCOMMERCE_ERROR_SET,
} from 'woocommerce/state/action-types';
import { LOADING, ERROR } from 'woocommerce/state/constants';
import { decodeEntities } from 'lib/formatting';

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

	[ WOOCOMMERCE_ERROR_SET ]: ( state, { originalAction: { type } } ) => {
		return WOOCOMMERCE_LOCATIONS_REQUEST === type ? ERROR : state;
	},
} );
