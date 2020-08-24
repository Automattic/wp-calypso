/**
 * External dependencies
 */

import { get, filter, find, findIndex, remove } from 'lodash';

/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'state/ui/selectors';
import {
	getPaymentMethods,
	arePaymentMethodsLoaded,
} from 'woocommerce/state/sites/payment-methods/selectors';

export const getPaymentMethodsEdits = ( state, siteId ) => {
	return get( state, [ 'extensions', 'woocommerce', 'ui', 'payments', siteId, 'methods' ] );
};

/**
 * @param {object} state Whole Redux state tree
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {Array} All changes made to method
 */
export const getPaymentMethodEdits = ( state, siteId ) => {
	return get( state, [
		'extensions',
		'woocommerce',
		'ui',
		'payments',
		siteId,
		'methods',
		'currentlyEditingChanges',
	] );
};

/**
 * @param {object} state Whole Redux state tree
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {Array} The list of payment methods that the UI should show. That will be the list of methods returned by
 * the wc-api with the edits "overlayed" on top of them.
 */
export const getPaymentMethodsWithEdits = ( state, siteId = getSelectedSiteId( state ) ) => {
	if ( ! arePaymentMethodsLoaded( state, siteId ) ) {
		return [];
	}
	const methods = [ ...getPaymentMethods( state, siteId ) ];
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

		const method = {
			...methods[ index ],
			settings: { ...methods[ index ].settings },
		};
		Object.keys( update ).map( function ( updateKey ) {
			if ( 'id' === updateKey ) {
				return;
			}
			if ( 'enabled' === updateKey ) {
				method.enabled = update[ updateKey ];
				return;
			}
			if ( 'description' === updateKey ) {
				method.description = update[ updateKey ].value;
				return;
			}
			if ( 'title' === updateKey ) {
				// Edits to title need to update base title attribute
				// and settings value too, thus no return here.
				method.title = update[ updateKey ].value;
			}
			method.settings[ updateKey ] = {
				...method.settings[ updateKey ],
				value: update[ updateKey ].value,
			};
		} );
		methods[ index ] = method;
	} );
	return [ ...methods, ...creates ];
};

/**
 * Are payment settings setup?
 *
 * @param {object} state Global state tree
 * @param {number} siteId wpcom site id
 * @returns {boolean} Bool indicating if payments are setup
 */
export const arePaymentsSetup = ( state, siteId = getSelectedSiteId( state ) ) => {
	return !! filter( getPaymentMethodsWithEdits( state, siteId ), function ( method ) {
		return method.enabled && 'cheque' !== method.id;
	} ).length;
};

/**
 * Gets group of payment methods. (offline, off-site, on-site)
 *
 * @param {object} state Global state tree
 * @param {string} type type of payment method
 * @param {number} siteId wpcom site id
 * @returns {Array} Array of Payment Methods of requested type
 */
export const getPaymentMethodsGroup = ( state, type, siteId = getSelectedSiteId( state ) ) => {
	return filter( getPaymentMethodsWithEdits( state, siteId ), { methodType: type } );
};

/**
 * @param {object} state Whole Redux state tree
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {object|null} The payment methods that's currently being edited, with all the edits
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

	const method = find( getPaymentMethodsWithEdits( state, siteId ), {
		id: edits.currentlyEditingId,
	} );
	if ( ! method || ! edits.currentlyEditingChanges ) {
		return { ...method };
	}
	const settings = { ...method.settings };
	let description = method.description;
	Object.keys( edits.currentlyEditingChanges ).forEach( function ( edit ) {
		if ( 'description' === edit ) {
			description = edits.currentlyEditingChanges[ edit ].value;
		} else {
			settings[ edit ] = { ...settings[ edit ], ...edits.currentlyEditingChanges[ edit ] };
		}
	} );
	return { ...method, settings, description };
};

/**
 * @param {object} state Whole Redux state tree
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {boolean} Whether the user is currently editing a payment method.
 */
export const isCurrentlyEditingPaymentMethod = ( state, siteId = getSelectedSiteId( state ) ) => {
	return Boolean( getCurrentlyEditingPaymentMethod( state, siteId ) );
};
