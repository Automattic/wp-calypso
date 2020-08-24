/**
 * External dependencies
 */
import { filter } from 'lodash';
/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'state/ui/selectors';
import { areOrderNotesLoaded, areOrderNotesLoading, getOrderNotes } from '../notes/selectors';
import { getOrder } from '../selectors';
import { getOrderRefunds } from '../refunds/selectors';
import {
	isError as areShippingLabelsErrored,
	isLoaded as areShippingLabelsLoaded,
	isFetching as areShippingLabelsLoading,
	getLabels,
} from 'woocommerce/woocommerce-services/state/shipping-label/selectors';
import * as plugins from 'woocommerce/state/selectors/plugins';

/*
 * Enum with the types of events that can be displayed in the Order Activity Log
 */
export const EVENT_TYPES = {
	/**
	 * Note made by the admin *and* sent to the customer via e-mail
	 */
	CUSTOMER_NOTE: 'CUSTOMER_NOTE',

	/**
	 * Note made by the admin
	 */
	INTERNAL_NOTE: 'INTERNAL_NOTE',

	/**
	 * A state in which label purchases are still pending.
	 */
	LABEL_PURCHASING: 'LABEL_PURCHASING',

	/**
	 * "Shipping label purchased" event, which will include tracking number, buttons to refund & reprint, and other info
	 */
	LABEL_PURCHASED: 'LABEL_PURCHASED',

	/**
	 * Logged when a refund was requested for a shipping label. Will be omitted if the refund was completed or rejected
	 */
	LABEL_REFUND_REQUESTED: 'LABEL_REFUND_REQUESTED',

	/**
	 * Logged when a shipping label refund was completed.
	 */
	LABEL_REFUND_COMPLETED: 'LABEL_REFUND_COMPLETED',

	/**
	 * Logged when a shipping label refund was rejected.
	 */
	LABEL_REFUND_REJECTED: 'LABEL_REFUND_REJECTED',

	/**
	 * A refund record for the given order
	 */
	REFUND_NOTE: 'REFUND_NOTE',
};

/**
 * @param {object} state Whole Redux state tree
 * @param {number} orderId Order ID to check.
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {boolean} Whether the activity log for a given order has been successfully loaded from the server.
 */
export const isActivityLogLoaded = ( state, orderId, siteId = getSelectedSiteId( state ) ) => {
	const notesLoaded = areOrderNotesLoaded( state, orderId, siteId );
	if ( ! notesLoaded ) {
		return false;
	}

	if (
		! plugins.isWcsEnabled( state, siteId ) ||
		areShippingLabelsErrored( state, orderId, siteId )
	) {
		return true;
	}

	return areShippingLabelsLoaded( state, orderId, siteId );
};

/**
 * @param {object} state Whole Redux state tree
 * @param {number} orderId Order ID to check.
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {boolean} Whether the activity log for a given order is currently being retrieved from the server.
 */
export const isActivityLogLoading = ( state, orderId, siteId = getSelectedSiteId( state ) ) => {
	const notesLoading = areOrderNotesLoading( state, orderId, siteId );
	if ( notesLoading ) {
		return true;
	}

	if (
		! plugins.isWcsEnabled( state, siteId ) ||
		areShippingLabelsErrored( state, orderId, siteId )
	) {
		return false;
	}

	return areShippingLabelsLoading( state, orderId, siteId );
};

/**
 * @param {object} state Whole Redux state tree
 * @param {number} orderId Order ID to check.
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {object[]} List of events to display. Each event will have at least these properties:
 * - {string} type The type of the event. See the EVENT_TYPES enum.
 * - {number} key A unique ID for the event. The combination of "type + key" must be unique in the whole list.
 * - {number} timestamp The time of the event.
 */
export const getActivityLogEvents = ( state, orderId, siteId = getSelectedSiteId( state ) ) => {
	const order = getOrder( state, orderId, siteId );
	const events = getOrderNotes( state, orderId, siteId ).map( ( note ) => ( {
		key: note.id,
		type: note.customer_note ? EVENT_TYPES.CUSTOMER_NOTE : EVENT_TYPES.INTERNAL_NOTE,
		timestamp: new Date( note.date_created_gmt + 'Z' ).getTime(),
		content: note.note,
	} ) );

	getOrderRefunds( state, orderId, siteId ).forEach( ( refund ) => {
		events.push( {
			key: refund.id,
			type: EVENT_TYPES.REFUND_NOTE,
			timestamp: new Date( refund.date_created_gmt + 'Z' ).getTime(),
			amount: refund.amount,
			reason: refund.reason,
			currency: order.currency,
		} );
	} );

	if ( plugins.isWcsEnabled( state, siteId ) ) {
		const labels = getLabels( state, orderId, siteId );
		const renderableLabels = filter(
			labels,
			( label ) =>
				-1 !== [ 'PURCHASED', 'ANONYMIZED', 'PURCHASE_IN_PROGRESS' ].indexOf( label.status )
		);

		renderableLabels.forEach( ( label, index, allLabels ) => {
			const labelIndex = allLabels.length - 1 - index;
			if ( label.refund ) {
				switch ( label.refund.status ) {
					case 'complete':
						events.push( {
							key: label.label_id,
							type: EVENT_TYPES.LABEL_REFUND_COMPLETED,
							timestamp: label.refund.refund_date,
							serviceName: label.service_name,
							labelIndex,
							amount: parseFloat( label.refund.amount ) || label.refundable_amount,
							currency: label.currency,
						} );
						break;
					case 'rejected':
						events.push( {
							key: label.label_id,
							type: EVENT_TYPES.LABEL_REFUND_REJECTED,
							timestamp: label.refund.refund_date,
							serviceName: label.service_name,
							labelIndex,
						} );
						break;
					default:
						// Only render the "refund requested" event if the refund hasn't yet completed/rejected
						events.push( {
							key: label.label_id,
							type: EVENT_TYPES.LABEL_REFUND_REQUESTED,
							timestamp: label.refund.request_date,
							serviceName: label.service_name,
							labelIndex,
							amount: parseFloat( label.refund.amount ) || label.refundable_amount,
							currency: label.currency,
						} );
				}
			}

			if ( 'PURCHASE_IN_PROGRESS' === label.status ) {
				return events.push( {
					key: label.label_id,
					type: EVENT_TYPES.LABEL_PURCHASING,
					labelIndex,
					labelId: label.label_id,
					serviceName: label.service_name,
					carrierId: label.carrier_id,
				} );
			}

			events.push( {
				key: label.label_id,
				type: EVENT_TYPES.LABEL_PURCHASED,
				timestamp: label.created_date,
				createdDate: label.created_date,
				usedDate: label.used_date,
				expiryDate: label.expiry_date,
				labelIndex,
				labelId: label.label_id,
				// TODO: Currently we only store the names of the items & packages, we need to store more data to show dimensions etc
				productNames: label.product_names,
				packageName: label.package_name,
				receiptId: label.main_receipt_id,
				serviceName: label.service_name,
				tracking: label.tracking,
				carrierId: label.carrier_id,
				amount: label.rate,
				refundableAmount: label.refundable_amount,
				currency: label.currency,
				anonymized: 'ANONYMIZED' === label.status,
				// If there's a refund in progress or completed, the Reprint/Refund buttons or the tracking number must *not* be shown
				showDetails:
					! label.refund || 'rejected' === label.refund.status || 'unknown' === label.refund.status,
			} );
		} );
	}

	return events;
};
