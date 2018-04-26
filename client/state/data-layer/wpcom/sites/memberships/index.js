/** @format */

/**
 * External dependencies
 */

import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import { SIMPLE_PAYMENTS_PRODUCTS_LIST } from 'state/action-types';

import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequestEx, TransformerError } from 'state/data-layer/wpcom-http/utils';

export const membershipProductFromApi = product => ( {
	ID: product.id || product.connected_account_product_id,
	currency: product.currency,
	description: product.description,
	email: '',
	featuredImageId: null,
	formatted_price: product.price,
	multiple: false,
	price: product.price,
	title: product.title,
	recurring: true,
} );

export const handleMembershipsList = dispatchRequestEx( {
	fetch: action =>
		http(
			{
				method: 'GET',
				path: `/sites/${ action.siteId }/memberships/products`,
			},
			action
		),
	fromApi: function( endpointResponse ) {
		if ( ! endpointResponse.products ) {
			throw new TransformerError(
				'This is from Simple Payments response. We have to disregard it since' +
					'for some reason data layer does not handle multiple handlers corretly.'
			);
		}
		const products = endpointResponse.products.map( membershipProductFromApi );
		return products;
	},
	onSuccess: ( { siteId }, products ) => ( {
		type: 'MEMBERSHIPS_PRODUCTS_RECEIVE',
		siteId,
		products,
	} ),
	onError: noop,
} );

export default {
	[ SIMPLE_PAYMENTS_PRODUCTS_LIST ]: [ handleMembershipsList ],
};
