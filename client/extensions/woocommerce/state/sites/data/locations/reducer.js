/**
 * Internal dependencies
 */

import { withoutPersistence } from 'state/utils';
import {
	WOOCOMMERCE_LOCATIONS_REQUEST,
	WOOCOMMERCE_LOCATIONS_REQUEST_SUCCESS,
	WOOCOMMERCE_ERROR_SET,
} from 'woocommerce/state/action-types';
import { LOADING, ERROR } from 'woocommerce/state/constants';
import { decodeEntities } from 'lib/formatting';

export default withoutPersistence( ( state = null, action ) => {
	switch ( action.type ) {
		case WOOCOMMERCE_LOCATIONS_REQUEST: {
			return LOADING;
		}
		case WOOCOMMERCE_LOCATIONS_REQUEST_SUCCESS: {
			const { data } = action;
			return data.map( ( continent ) => ( {
				code: continent.code,
				name: decodeEntities( continent.name ),
				countries: continent.countries.map( ( country ) => ( {
					code: country.code,
					name: decodeEntities( country.name ),
					states: country.states.map( ( countryState ) => ( {
						code: countryState.code,
						name: decodeEntities( countryState.name ),
					} ) ),
				} ) ),
			} ) );
		}
		case WOOCOMMERCE_ERROR_SET: {
			const {
				originalAction: { type },
			} = action;
			return WOOCOMMERCE_LOCATIONS_REQUEST === type ? ERROR : state;
		}
	}

	return state;
} );
