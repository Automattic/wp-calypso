/** @format */

/**
 * External dependencies
 */

import { has, noop } from 'lodash';

/**
 * Internal dependencies
 */
import { SIMPLE_PAYMENTS_PRODUCTS_LIST } from 'state/action-types';

import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequestEx } from 'state/data-layer/wpcom-http/utils';

export const handleMembershipsList = dispatchRequestEx( {
	fetch: action =>
		http(
			{
				method: 'GET',
				path: `/sites/${ action.siteId }/memberships/products`,
			},
			action
		),
	onSuccess: function( endpointResponse ) {
		if ( has( endpointResponse, 'meta.dataLayer.data.products' ) ) {
			return {
				type: 'MEMBERSHIPS_PRODUCTS_RECEIVE',
				products: endpointResponse.meta.dataLayer.data.products,
			};
		}
	},
	onError: noop,
} );

export default {
	[ SIMPLE_PAYMENTS_PRODUCTS_LIST ]: [ handleMembershipsList ],
};
