import {
	MEMBERSHIPS_PRODUCTS_RECEIVE,
	MEMBERSHIPS_PRODUCTS_LIST,
	MEMBERSHIPS_EARNINGS_GET,
	MEMBERSHIPS_EARNINGS_RECEIVE,
	MEMBERSHIPS_SUBSCRIBERS_RECEIVE,
	MEMBERSHIPS_SUBSCRIBERS_LIST,
	MEMBERSHIPS_SETTINGS,
	MEMBERSHIPS_SETTINGS_RECEIVE,
	MEMBERSHIPS_COUPONS_LIST,
	MEMBERSHIPS_COUPONS_RECEIVE,
} from 'calypso/state/action-types';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';

const noop = () => {};

export const membershipProductFromApi = ( product ) => ( {
	ID: parseInt( product.id || product.connected_account_product_id ),
	currency: product.currency,
	formatted_price: product.price,
	price: parseFloat( product.price ),
	title: product.title,
	renewal_schedule: product.interval,
	buyer_can_change_amount: product.buyer_can_change_amount,
	multiple_per_user: product.multiple_per_user,
	subscribe_as_site_subscriber: product.subscribe_as_site_subscriber,
	welcome_email_content: product.welcome_email_content,
	type: product.type,
	tier: product.tier,
} );

export const membershipCouponFromApi = ( coupon ) => ( {
	ID: parseInt( coupon.id ),
	coupon_code: coupon.coupon_code,
	discount_type: coupon.discount_type,
	discount_value: parseFloat( coupon.discount_value ),
	discount_percentage: parseFloat( coupon.discount_percentage ),
	discount_currency: coupon.discount_currency,
	start_date: coupon.start_date,
	end_date: coupon.end_date,
	plan_ids_allow_list: coupon.plan_ids_allow_list.map( ( productId ) => parseInt( productId ) ),
	cannot_be_combined: ! coupon.can_be_combined,
	can_be_combined: coupon.can_be_combined, // TODO: remove after backend migrates to 'cannot_be_combined'
	first_time_purchase_only: coupon.first_time_purchase_only ? true : false,
	duration: coupon.duration,
	email_allow_list: coupon.email_allow_list ?? [],
} );

export const membershipGiftFromApi = ( gift ) => ( {
	gift_id: parseInt( gift.gift_id ),
	user_id: parseInt( gift.user_id ),
	plan_id: parseInt( gift.plan_id ),
} );

export const handleMembershipProductsList = dispatchRequest( {
	fetch: ( action ) =>
		http(
			{
				method: 'GET',
				path: `/sites/${ action.siteId }/memberships/products?type=all&is_editable=true`,
				apiNamespace: 'wpcom/v2',
			},
			action
		),
	fromApi: function ( endpointResponse ) {
		// If the response has an error, return an empty array for products.
		if ( endpointResponse.hasOwnProperty( 'error' ) ) {
			return [];
		}

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

export const handleMembershipCouponsList = dispatchRequest( {
	fetch: ( action ) =>
		http(
			{
				method: 'GET',
				path: `/sites/${ action.siteId }/memberships/coupons?type=all&is_editable=true`,
				apiNamespace: 'wpcom/v2',
			},
			action
		),
	fromApi: function ( endpointResponse ) {
		const coupons = endpointResponse.map( membershipCouponFromApi );
		return coupons;
	},
	onSuccess: ( { siteId }, coupons ) => ( {
		type: MEMBERSHIPS_COUPONS_RECEIVE,
		siteId,
		coupons,
	} ),
	onError: noop,
} );

export const handleMembershipGetEarnings = dispatchRequest( {
	fetch: ( action ) =>
		http(
			{
				method: 'GET',
				path: `/sites/${ action.siteId }/memberships/earnings`,
				apiNamespace: 'wpcom/v2',
			},
			action
		),
	onSuccess: ( { siteId }, earnings ) => ( {
		type: MEMBERSHIPS_EARNINGS_RECEIVE,
		siteId,
		earnings,
	} ),
	onError: noop,
} );

export const handleMembershipGetSubscribers = dispatchRequest( {
	fetch: ( action ) =>
		http(
			{
				method: 'GET',
				path: `/sites/${ action.siteId }/memberships/subscribers?offset=${ action.offset }`,
				apiNamespace: 'wpcom/v2',
			},
			action
		),
	onSuccess: ( { siteId }, subscribers ) => ( {
		type: MEMBERSHIPS_SUBSCRIBERS_RECEIVE,
		siteId,
		subscribers,
	} ),
	onError: noop,
} );

export const handleMembershipGetSettings = dispatchRequest( {
	fetch: ( action ) =>
		http(
			{
				method: 'GET',
				path: `/sites/${ action.siteId }/memberships/status?source=${ action.source ?? 'calypso' }`,
				apiNamespace: 'wpcom/v2',
			},
			action
		),
	onSuccess: ( { siteId }, data ) => ( {
		type: MEMBERSHIPS_SETTINGS_RECEIVE,
		siteId,
		data,
	} ),
	onError: noop,
} );

registerHandlers( 'state/data-layer/wpcom/sites/memberships/index.js', {
	[ MEMBERSHIPS_PRODUCTS_LIST ]: [ handleMembershipProductsList ],
	[ MEMBERSHIPS_COUPONS_LIST ]: [ handleMembershipCouponsList ],
	[ MEMBERSHIPS_EARNINGS_GET ]: [ handleMembershipGetEarnings ],
	[ MEMBERSHIPS_SUBSCRIBERS_LIST ]: [ handleMembershipGetSubscribers ],
	[ MEMBERSHIPS_SETTINGS ]: [ handleMembershipGetSettings ],
} );
