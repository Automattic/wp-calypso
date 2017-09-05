/**
 * Internal dependencies
 */
import config from 'config';
import { getSelectedSiteId } from 'state/ui/selectors';
import { areOrderNotesLoaded, areOrderNotesLoading, getOrderNotes } from '../notes/selectors';
import {
	isLoaded as areShippingLabelsLoaded,
	isFetching as areShippingLabelsLoading,
	getLabels,
} from 'woocommerce/woocommerce-services/state/shipping-label/selectors'

export const EVENT_TYPES = {
	INTERNAL_NOTE: 'INTERNAL_NOTE',
	CUSTOMER_NOTE: 'CUSTOMER_NOTE',
	LABEL_PURCHASED: 'LABEL_PURCHASED',
	LABEL_REFUND_REQUESTED: 'LABEL_REFUND_REQUESTED',
	LABEL_REFUND_COMPLETED: 'LABEL_REFUND_COMPLETED',
	LABEL_REFUND_REJECTED: 'LABEL_REFUND_REJECTED',
};

export const isActivityLogLoaded = ( state, orderId, siteId = getSelectedSiteId( state ) ) => {
	return areOrderNotesLoaded( state, orderId, siteId ) &&
		( ! config.isEnabled( 'woocommerce/extension-wcservices' ) || areShippingLabelsLoaded( state, orderId, siteId ) );
};

export const isActivityLogLoading = ( state, orderId, siteId = getSelectedSiteId( state ) ) => {
	return areOrderNotesLoading( state, orderId, siteId ) &&
		( ! config.isEnabled( 'woocommerce/extension-wcservices' ) || areShippingLabelsLoading( state, orderId, siteId ) );
};

export const getActivityLogEvents = ( state, orderId, siteId = getSelectedSiteId( state ) ) => {
	const events = getOrderNotes( state, orderId, siteId ).map( note => ( {
		key: note.id,
		type: note.customer_note ? EVENT_TYPES.CUSTOMER_NOTE : EVENT_TYPES.INTERNAL_NOTE,
		timestamp: new Date( note.date_created_gmt + 'Z' ).getTime(),
		content: note.note,
	} ) );

	if ( config.isEnabled( 'woocommerce/extension-wcservices' ) ) {
		getLabels( state, orderId, siteId ).forEach( ( label, index ) => {
			if ( label.refund ) {
				switch ( label.refund.status ) {
					case 'complete':
						events.push( {
							key: label.label_id,
							type: EVENT_TYPES.LABEL_REFUND_COMPLETED,
							timestamp: label.refund.refund_date,
							labelIndex: index,
							amount: label.refund.amount,
							currency: label.currency,
						} );
						break;
					case 'rejected':
						events.push( {
							key: label.label_id,
							type: EVENT_TYPES.LABEL_REFUND_REJECTED,
							timestamp: label.refund.refund_date,
							labelIndex: index,
						} );
						break;
					default:
						events.push( {
							key: label.label_id,
							type: EVENT_TYPES.LABEL_REFUND_REQUESTED,
							timestamp: label.refund.request_date,
							labelIndex: index,
							amount: label.refund.amount,
							currency: label.currency,
						} );
				}
			}
			events.push( {
				key: label.label_id,
				type: EVENT_TYPES.LABEL_PURCHASED,
				timestamp: label.created_date,
				labelIndex: index,
				labelId: label.label_id,
				productNames: label.product_names,
				packageName: label.package_name,
				tracking: label.tracking,
				refundableAmount: label.refundable_amount,
				currency: label.currency,
				showDetails: ! label.refund || 'rejected' === label.refund.status || 'unknown' === label.refund.status,
			} );
		} );
	}

	return events;
};
