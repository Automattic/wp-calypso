import { withStorageKey } from '@automattic/state-utils';
import {
	SITE_PLANS_FETCH_COMPLETED,
	PRODUCTS_LIST_RECEIVE,
	SITE_PRODUCTS_FETCH_COMPLETED,
} from 'calypso/state/action-types';
import { withSchemaValidation } from 'calypso/state/utils';

const schema = { type: [ 'string', 'null' ] };

function reducer( state = null, action ) {
	switch ( action.type ) {
		case PRODUCTS_LIST_RECEIVE:
			return Object.values( action.productsList )[ 0 ]?.currency_code ?? state;

		case SITE_PLANS_FETCH_COMPLETED:
			return action.plans[ 0 ]?.currencyCode ?? state;

		case SITE_PRODUCTS_FETCH_COMPLETED:
			return Object.values( action.products )[ 0 ]?.currency_code ?? state;
	}

	return state;
}

export default withStorageKey( 'currencyCode', withSchemaValidation( schema, reducer ) );
