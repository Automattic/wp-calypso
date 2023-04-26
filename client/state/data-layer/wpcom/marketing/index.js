import {
	MARKETING_CLICK_UPGRADE_NUDGE,
	MARKETING_JETPACK_SALE_COUPON_FETCH,
} from 'calypso/state/action-types';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import {
	receiveJetpackSaleCoupon,
	fetchJetpackSaleCouponFailed,
} from 'calypso/state/marketing/actions';

const noop = () => {};

export const notifyUpgradeNudgeClick = ( action ) =>
	http(
		{
			method: 'POST',
			path: `/sites/${ action.siteId }/nudge/click`,
			apiNamespace: 'wpcom/v2',
			body: {
				nudge_name: action.nudgeName,
			},
		},
		action
	);

/**
 * Dispatches a request to fetch the Jetpack sale coupon
 *
 * @param {Object} action Redux action
 * @returns {Object} WordPress.com API HTTP Request action object
 */
export const fetchJetpackSaleCouponHandler = ( action ) =>
	http(
		{
			method: 'GET',
			apiNamespace: 'wpcom/v2',
			path: '/jetpack-marketing/sale-coupon',
		},
		action
	);

export const receiveJetpackSaleCouponHandler = ( action, jetpackSaleCoupon ) =>
	receiveJetpackSaleCoupon( jetpackSaleCoupon );

export const fetchJetpackSaleCouponOnErrorHandler = () => fetchJetpackSaleCouponFailed();

registerHandlers( 'state/data-layer/wpcom/marketing/index.js', {
	[ MARKETING_CLICK_UPGRADE_NUDGE ]: [
		dispatchRequest( {
			fetch: notifyUpgradeNudgeClick,
			onSuccess: noop,
			onError: noop,
		} ),
	],

	[ MARKETING_JETPACK_SALE_COUPON_FETCH ]: [
		dispatchRequest( {
			fetch: fetchJetpackSaleCouponHandler,
			onSuccess: receiveJetpackSaleCouponHandler,
			onError: fetchJetpackSaleCouponOnErrorHandler,
		} ),
	],
} );
