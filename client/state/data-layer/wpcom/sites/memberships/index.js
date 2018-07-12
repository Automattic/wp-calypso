/** @format */

/**
 * External dependencies
 */

import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import {
	MEMBERSHIPS_PRODUCTS_RECEIVE,
	MEMBERSHIPS_PRODUCTS_LIST,
	MEMBERSHIPS_SUBSCRIPTIONS_LIST,
	MEMBERSHIPS_SUBSCRIPTIONS_RECEIVE,
} from 'state/action-types';

import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequestEx } from 'state/data-layer/wpcom-http/utils';

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
	stripe_account: product.connected_destination_account_id,
	renewal_schedule: product.interval,
} );

export const handleMembershipProductsList = dispatchRequestEx( {
	fetch: action =>
		http(
			{
				method: 'GET',
				path: `/sites/${ action.siteId }/memberships/products`,
			},
			action
		),
	fromApi: function( endpointResponse ) {
		const products = endpointResponse.products.map( membershipProductFromApi );
		return products;
	},
	onSuccess: ( { siteId }, products ) => ( {
		type: MEMBERSHIPS_PRODUCTS_RECEIVE,
		siteId,
		products,
	} ),
	onError: noop,
} );

export const handleSubscribedMembershipsList = dispatchRequestEx( {
	fetch: action =>
		http(
			{
				method: 'GET',
				path: '/me/memberships/subscriptions',
			},
			action
		),
	onSuccess: ( {}, { subscriptions, total } ) => ( {
		type: MEMBERSHIPS_SUBSCRIPTIONS_RECEIVE,
		subscriptions,
		total,
	} ),
	onError: noop,
} );
export default {
	[ MEMBERSHIPS_PRODUCTS_LIST ]: [ handleMembershipProductsList ],
	[ MEMBERSHIPS_SUBSCRIPTIONS_LIST ]: [ handleSubscribedMembershipsList ],
};
