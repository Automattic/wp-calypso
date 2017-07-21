/**
 * External dependencies
 */
import _ from 'lodash';

/**
 * Internal dependencies
 */
import {
	ADD_PACKAGE,
	REMOVE_PACKAGE,
	EDIT_PACKAGE,
	DISMISS_MODAL,
	SET_IS_SAVING,
	SET_MODAL_ERRORS,
	SET_SELECTED_PRESET,
	UPDATE_PACKAGES_FIELD,
	SAVE_PACKAGE,
	TOGGLE_OUTER_DIMENSIONS,
	TOGGLE_ALL,
	TOGGLE_PACKAGE,
	SET_IS_FETCHING,
	INIT_PACKAGES_FORM,
} from './actions';

export const initialState = {
	modalErrors: {},
};

const isNullOrEmpty = ( value ) => null === value || '' === _.trim( value );

const reducers = {};

reducers[ ADD_PACKAGE ] = ( state ) => {
	const newState = Object.assign( {}, state, {
		showModal: true,
		mode: 'add',
	} );

	if ( 'edit' === state.mode || ! newState.packageData ) {
		newState.packageData = { is_user_defined: true };
	}

	return newState;
};

reducers[ EDIT_PACKAGE ] = ( state, action ) => {
	return Object.assign( {}, state, {
		showModal: true,
		modalReadOnly: false,
		mode: 'edit',
		packageData: action.package,
		showOuterDimensions: false,
	} );
};

reducers[ DISMISS_MODAL ] = ( state ) => {
	return Object.assign( {}, state, {
		modalErrors: {},
		showModal: false,
		showOuterDimensions: false,
	} );
};

reducers[ SET_MODAL_ERRORS ] = ( state, action ) => {
	return Object.assign( {}, state, {
		modalErrors: action.value,
	} );
};

reducers[ SET_SELECTED_PRESET ] = ( state, action ) => {
	return Object.assign( {}, state, {
		selectedPreset: action.value,
	} );
};

reducers[ UPDATE_PACKAGES_FIELD ] = ( state, action ) => {
	const mergedPackageData = Object.assign( {}, state.packageData, action.values );
	const newPackageData = _.omitBy( mergedPackageData, isNullOrEmpty );
	return Object.assign( {}, state, {
		packageData: newPackageData,
		pristine: false,
	} );
};

reducers[ SAVE_PACKAGE ] = ( state, action ) => {
	const packageData = action.packageData;
	const custom = state.packages.custom || [];

	if ( packageData.box_weight ) {
		packageData.box_weight = Number.parseFloat( packageData.box_weight );
	}

	if ( packageData.max_weight ) {
		packageData.max_weight = Number.parseFloat( packageData.max_weight );
	}

	if ( 'index' in packageData ) {
		const { index } = packageData;
		const item = _.omit( packageData, 'index' );

		custom[ index ] = item;
	} else {
		custom.push( packageData );
	}

	return {
		...state,
		showModal: false,
		mode: 'add',
		packageData: {
			is_user_defined: true,
		},
		packages: {
			...state.packages,
			custom,
		},
		showOuterDimensions: false,
		selectedPreset: null,
		pristine: false,
	};
};

reducers[ TOGGLE_OUTER_DIMENSIONS ] = ( state ) => {
	return {
		...state,
		showOuterDimensions: true,
	};
};

reducers[ REMOVE_PACKAGE ] = ( state, action ) => {
	const custom = [ ...state.packages.custom ];
	custom.splice( action.index, 1 );
	return {
		...state,
		packages: {
			...state.packages,
			custom,
		},
		pristine: false,
	};
};

reducers[ TOGGLE_ALL ] = ( state, { serviceId, groupId, checked } ) => {
	const groupPackages = state.predefinedSchema[ serviceId ][ groupId ].definitions.map( ( def ) => def.id );
	const selected = state.packages.predefined[ serviceId ];
	const newSelected = checked ? _.uniq( _.concat( selected, groupPackages ) ) : _.difference( selected, groupPackages );

	const newPredefined = {	...state.packages.predefined };
	newPredefined[ serviceId ] = newSelected;

	return {
		...state,
		packages: {
			...state.packages,
			predefined: newPredefined,
		},
		pristine: false,
	};
};

reducers[ TOGGLE_PACKAGE ] = ( state, { serviceId, packageId } ) => {
	const newPredefined = {	...state.packages.predefined };
	const newSelected = [ ...( newPredefined[ serviceId ] || [] ) ];
	const packageIndex = newSelected.indexOf( packageId );

	if ( -1 === packageIndex ) {
		newSelected.push( packageId );
	} else {
		newSelected.splice( packageIndex, 1 );
	}

	newPredefined[ serviceId ] = newSelected;

	return {
		...state,
		packages: {
			...state.packages,
			predefined: newPredefined,
		},
		pristine: false,
	};
};

reducers[ SET_IS_SAVING ] = ( state, action ) => {
	return Object.assign( {}, state, {
		isSaving: action.isSaving,
		pristine: ! action.isSaving, //set pristine after the form has been saved
	} );
};

reducers[ SET_IS_FETCHING ] = ( state, { isFetching } ) => {
	return { ...state,
		isFetching,
	};
};

reducers[ INIT_PACKAGES_FORM ] = ( state, { packages, dimensionUnit, weightUnit, packageSchema, predefinedSchema } ) => {
	return { ...state,
		packages,
		dimensionUnit,
		weightUnit,
		packageSchema,
		predefinedSchema,
	};
};

const packages = ( state = initialState, action ) => {
	if ( 'function' === typeof reducers[ action.type ] ) {
		return reducers[ action.type ]( state, action );
	}
	return state;
};

export default packages;
