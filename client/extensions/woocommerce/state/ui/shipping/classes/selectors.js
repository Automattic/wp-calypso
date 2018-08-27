/** @format */

/**
 * External dependencies
 */
import { get, merge } from 'lodash';

/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'state/ui/selectors';
import {
	getShippingClassOptions,
	getShippingClassFromState,
} from 'woocommerce/state/sites/shipping-classes/selectors';

// const getShippingClassesEdits = ( state, siteId ) => get(
// 	state,
// 	[ 'extensions', 'woocommerce', 'ui', 'shipping', siteId, 'classes', 'editing' ],
// 	[]
// );
//
// const getShippingClassChanges = ( state, classId, siteId ) => {
// 	const changes = get(
// 		state,
// 		[ 'extensions', 'woocommerce', 'ui', 'shipping', siteId, 'classes', 'changes' ],
// 		{}
// 	);
//
// 	return changes[ classId ] || {};
// };
//
// const getShippingClassesSaves = ( state, siteId ) => get(
// 	state,
// 	[ 'extensions', 'woocommerce', 'ui', 'shipping', siteId, 'classes', 'saving' ],
// 	[]
// );
//
// export const getUiShippingClasses = ( state, siteId = getSelectedSiteId( state ) ) => {
// 	const standard = getShippingClassOptions( state, siteId );
//
// 	const adding = get(
// 		state,
// 		[ 'extensions', 'woocommerce', 'ui', 'shipping', siteId, 'classes', 'adding' ],
// 		[]
// 	);
//
// 	return [ ...standard, ...adding ];
// }
//
// export const isShippingClassBeingEdited = ( state, classId, siteId = getSelectedSiteId( state ) ) => {
// 	const edits = getShippingClassesEdits( state, siteId );
//
// 	return -1 !== edits.indexOf( classId );
// }
//
// export const isShippingClassBeingSaved = ( state, classId, siteId = getSelectedSiteId( state ) ) => {
// 	const saves = getShippingClassesSaves( state, siteId );
//
// 	return -1 !== saves.indexOf( classId );
// }
//
// export const getShippingClassWithChanges = ( state, classId, siteId = getSelectedSiteId( state ) ) => {
// 	const shippingClass = getShippingClassFromState( state, classId, siteId ) || {};
// 	const changes = getShippingClassChanges( state, classId, siteId );
// 	return merge( {}, shippingClass, changes );
// }
//
// export const getShippingClassField = ( state, classId, field, siteId = getSelectedSiteId( state ) ) => {
// 	const data = getShippingClassWithChanges( state, classId, siteId );
//
// 	return data[ field ];
// }

const getLocalState = ( state, siteId ) =>
	get( state, [ 'extensions', 'woocommerce', 'ui', 'shipping', siteId, 'classes' ], {} );

export const getUiShippingClasses = ( state, siteId = getSelectedSiteId( state ) ) => {
	const standard = getShippingClassOptions( state, siteId );

	const adding = get(
		state,
		[ 'extensions', 'woocommerce', 'ui', 'shipping', siteId, 'classes', 'creating' ],
		[]
	);

	return [ ...standard, ...adding ];
};

export const getCurrentlyOpenShippingClass = ( state, siteId ) => {
	const localState = getLocalState( state, siteId );

	if ( ! localState.editing ) {
		return null;
	}

	const existingData = localState.classId
		? getShippingClassFromState( state, localState.classId, siteId )
		: {
				name: '',
				slug: '',
				description: '',
		  };

	return merge( {}, existingData, localState.changes );
};

export const isCurrentlyOpenShippingClassNew = ( state, siteId ) => {
	const localState = getLocalState( state, siteId );

	return null === localState.classId;
};

export const getCurrentlyOpenShippingClassSavingArgs = ( state, siteId ) => {
	const localState = getLocalState( state, siteId );
	const { classId, changes } = localState;

	if ( null === classId ) {
		return {
			isNew: true,
			data: changes,
		};
	}

	if ( 0 === Object.keys( changes ).length ) {
		return null;
	}

	return {
		isNew: false,
		id: classId,
		changes: changes,
	};
};

export const isShippingClassBeingSaved = ( state, classId, siteId ) => {
	const localState = getLocalState( state, siteId );

	return localState.saving && -1 !== localState.saving.indexOf( classId );
};

export const isShippingClassBeingDeleted = ( state, classId, siteId ) => {
	const localState = getLocalState( state, siteId );

	return localState.deleting && -1 !== localState.deleting.indexOf( classId );
};
