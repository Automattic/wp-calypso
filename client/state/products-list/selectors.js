/**
 * External dependencies
 */
import {
	flowRight as compose,
	property,
} from 'lodash';

/**
 * Internal dependencies
 */
import {
	getProductsListState,
} from 'state/selectors';

export const getProductsList = compose(
	property( 'items' ),
	getProductsListState,
);

export const isProductsListFetching = compose(
	property( 'isFetching' ),
	getProductsListState,
);
