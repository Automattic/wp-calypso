/**
 * External dependencies
 */
import { get, filter, find, findIndex, remove } from 'lodash';

/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'state/ui/selectors';
import { getApiPaymentMethods, arePaymentMethodsLoaded } from 'woocommerce/state/sites/payment-methods/selectors';

const getPaymentMethodsEdits = ( state, siteId ) => {
	return get( state, [ 'extensions', 'woocommerce', 'ui', 'payments', siteId, 'methods' ] );
};

/**
 * @param {Object} state Whole Redux state tree
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {Array} All changes made to method
 */
export const getPaymentMethodEdits = ( state, siteId ) => {
	return get( state, [ 'extensions', 'woocommerce', 'ui', 'payments', siteId, 'methods', 'currentlyEditingChanges' ] );
};

/**
 * @param {Object} state Whole Redux state tree
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {Array} The list of payment methods that the UI should show. That will be the list of methods returned by
 * the wc-api with the edits "overlayed" on top of them.
 */
export const getPaymentMethods = ( state, siteId = getSelectedSiteId( state ) ) => {
	if ( ! arePaymentMethodsLoaded( state, siteId ) ) {
		return [];
	}
	const methods = [ ...getApiPaymentMethods( state, siteId ) ];
	const edits = getPaymentMethodsEdits( state, siteId );
	if ( ! edits ) {
		return methods;
	}
	// Overlay the current edits on top of (a copy of) the wc-api methods
	const { creates, updates, deletes } = edits;
	deletes.forEach( ( { id } ) => remove( methods, { id } ) );
	updates.forEach( ( update ) => {
		const index = findIndex( methods, { id: update.id } );
		if ( -1 === index ) {
			return;
		}
		const updateEdits = {};
		Object.keys( update ).map( function( updateKey ) {
			if ( updateKey === 'id' ) {
				return;
			}
			updateEdits[ updateKey ] = update[ updateKey ].value;
		} );

		methods[ index ] = { ...methods[ index ], ...updateEdits };
	} );
	return [ ...methods, ...creates ];
};

/**
 * Gets group of payment methods. (offline, off-site, on-site)
 *
 * @param {Object} state Global state tree
 * @param {String} type type of payment method
 * @param {Number} siteId wpcom site id
 * @return {Array} Array of Payment Methods of requested type
 */
export const getPaymentMethodsGroup = ( state, type, siteId = getSelectedSiteId( state ) ) => {
	return filter( getPaymentMethods( state, siteId ), { methodType: type } );
};

/**
 * @param {Object} state Whole Redux state tree
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {Object|null} The payment methods that's currently being edited, with all the edits
 * (including the non-committed changes). If no method is being edited, this will return null.
 */
export const getCurrentlyEditingPaymentMethod = ( state, siteId = getSelectedSiteId( state ) ) => {
	const edits = getPaymentMethodsEdits( state, siteId );
	if ( ! edits ) {
		return null;
	}
	if ( null === edits.currentlyEditingId ) {
		return null;
	}

	const method = find( getPaymentMethods( state, siteId ), { id: edits.currentlyEditingId } );
	if ( ! method || ! edits.currentlyEditingChanges ) {
		return { ...method };
	}
	const settings = { ...method.settings };
	Object.keys( edits.currentlyEditingChanges ).forEach( function( edit ) {
		settings[ edit ] = { ...settings[ edit ], ...edits.currentlyEditingChanges[ edit ] };
	} );
	return { ...method, settings };
};

/**
 * @param {Object} state Whole Redux state tree
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {Boolean} Whether the user is currently editing a payment method.
 */
export const isCurrentlyEditingPaymentMethod = ( state, siteId = getSelectedSiteId( state ) ) => {
	return Boolean( getCurrentlyEditingPaymentMethod( state, siteId ) );
};
