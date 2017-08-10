/** @format */
/**
 * Internal dependencies
 */
import { fetchOrder } from '../actions';
import { getSelectedSiteId } from 'state/ui/selectors';
import { isOrderRefunding } from './selectors';
import request from 'woocommerce/state/sites/request';
import { successNotice, errorNotice } from 'state/notices/actions';
import { translate } from 'i18n-calypso';
import {
	WOOCOMMERCE_ORDER_REFUND_CREATE,
	WOOCOMMERCE_ORDER_REFUND_CREATE_SUCCESS,
	WOOCOMMERCE_ORDER_REFUND_CREATE_FAILURE,
} from 'woocommerce/state/action-types';

export const sendRefund = ( siteId, orderId, refund ) => ( dispatch, getState ) => {
	const state = getState();
	if ( ! siteId ) {
		siteId = getSelectedSiteId( state );
	}
	if ( isOrderRefunding( state, orderId, siteId ) ) {
		return;
	}

	dispatch( {
		type: WOOCOMMERCE_ORDER_REFUND_CREATE,
		siteId,
		orderId,
	} );

	return request( siteId )
		.post( `orders/${ orderId }/refunds`, refund )
		.then( () => {
			dispatch( successNotice( translate( 'Refund granted.' ), { duration: 5000 } ) );
			dispatch( fetchOrder( siteId, orderId, true ) );
			dispatch( {
				type: WOOCOMMERCE_ORDER_REFUND_CREATE_SUCCESS,
				siteId,
				orderId,
			} );
		} )
		.catch( error => {
			dispatch( errorNotice( translate( 'Unable to grant refund.' ), { duration: 5000 } ) );
			dispatch( {
				type: WOOCOMMERCE_ORDER_REFUND_CREATE_FAILURE,
				siteId,
				orderId,
				error,
			} );
		} );
};
