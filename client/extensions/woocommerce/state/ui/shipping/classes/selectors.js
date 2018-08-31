/** @format */

/**
 * External dependencies
 */
import { get, map, find } from 'lodash';

/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'state/ui/selectors';
import { getShippingClassOptions } from 'woocommerce/state/sites/shipping-classes/selectors';

/**
 * A shortcut that extracts the the shipping classes UI state from the whole state.
 *
 * @param  {Object} state   The current Redux state.
 * @param  {number} siteId  Site ID.
 * @return {Object}         The local state.
 */
export const getUiShippingClassesState = ( state, siteId = getSelectedSiteId( state ) ) => {
	return get( state, [ 'extensions', 'woocommerce', 'ui', 'shipping', siteId, 'classes' ], {} );
};

/**
 * Loads the list of shipping classes for the UI, which includes:
 * 1. All saved shipping classes
 * 2. All newly created shipping classes
 * 3. All applied updates
 * 4. But not deleted classes
 *
 * This selector loads the interim state of data, as it is manipulated before being saved.
 *
 * @param  {Object} state   The current Redux state.
 * @param  {number} siteId  Site ID.
 * @return {Array}          All shipping classes.
 */
export const getUiShippingClasses = ( state, siteId = getSelectedSiteId( state ) ) => {
	const localState = getUiShippingClassesState( state, siteId );

	const deleted = get( localState, 'deleted', [] );
	const updates = get( localState, 'updates', [] );
	const created = get( localState, 'created', [] );

	// Merge the existing classes and add the basics of newly added ones
	const merged = [
		...getShippingClassOptions( state, siteId ),

		// Start with a simple ID, updates will be applied later
		...map( created, id => ( { id, isNew: true } ) ),
	];

	// Apply all updates consequentially
	const withUpdates = merged.map( shippingClass => {
		updates.forEach( item => {
			if ( item.id === shippingClass.id ) {
				shippingClass = {
					...shippingClass,
					...item,
				};
			}
		} );

		return shippingClass;
	} );

	const withoutDeleted = withUpdates.filter( shippingClass => {
		return -1 === deleted.indexOf( shippingClass.id );
	} );

	return withoutDeleted;
};

/**
 * Prepares all of the data for the shipping class that is being edited, if any.
 *
 * @param  {Object} state  The current Redux state.
 * @param  {number} siteId Site ID.
 * @return {Array}         A list of all used properties.
 */
export const getCurrentlyOpenShippingClass = ( state, siteId ) => {
	const { editing, editingClass, changes } = getUiShippingClassesState( state, siteId );

	if ( ! editing ) {
		return null;
	}

	const existingClasses = getUiShippingClasses( state, siteId );
	const existingData = find( existingClasses, { id: editingClass } ) || {};

	return {
		name: '',
		slug: '',
		description: '',
		...existingData,
		...changes,
	};
};

/**
 * Checks whether the class that is currently being edited is new.
 *
 * @param  {Object} state   The current Redux state.
 * @param  {number} siteId  Site ID.
 * @return {boolean}        A flag that indicates whether the class exists or not.
 */
export const isCurrentlyOpenShippingClassNew = ( state, siteId ) => {
	return null === getUiShippingClassesState( state, siteId ).editingClass;
};

/**
 * Generates a list of all values, associated with a specific property of a shipping class.
 *
 * @param  {Object} state   The current Redux state.
 * @param  {string} prop    The name of the property to retrieve.
 * @param  {number} classId The ID of the edited class, used to ignore its value.
 * @param  {number} siteId  Site ID.
 * @return {Array}          A list of all used properties.
 */
export const getUsedShippingClassProps = ( state, prop, classId, siteId ) => {
	const props = [];

	getUiShippingClasses( state, siteId ).forEach( shippingClass => {
		if ( classId && shippingClass.id === classId ) {
			return;
		}

		props.push( shippingClass[ prop ] );
	} );

	return props;
};
