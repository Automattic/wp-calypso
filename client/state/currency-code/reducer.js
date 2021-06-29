/**
 * Internal dependencies
 */
import {
	SITE_PLANS_FETCH_COMPLETED,
	PLANS_RECEIVE,
	PRODUCTS_LIST_RECEIVE,
} from 'calypso/state/action-types';
import { withSchemaValidation } from 'calypso/state/utils';

const schema = { type: [ 'string', 'null' ] };

function reducer( state = null, action ) {
	switch ( action.type ) {
		case PRODUCTS_LIST_RECEIVE:
			return Object.values( action.productsList )[ 0 ]?.currency_code ?? state;

		case PLANS_RECEIVE:
			return action.plans[ 0 ]?.currency_code ?? state;

		case SITE_PLANS_FETCH_COMPLETED:
			return action.plans[ 0 ]?.currencyCode ?? state;
	}

	return state;
}

export default withSchemaValidation( schema, reducer );
