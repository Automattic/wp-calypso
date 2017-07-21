/**
 * Internal dependencies
 */
import * as api from 'api';

export const ADD_PACKAGE = 'ADD_PACKAGE';
export const REMOVE_PACKAGE = 'REMOVE_PACKAGE';
export const EDIT_PACKAGE = 'EDIT_PACKAGE';
export const DISMISS_MODAL = 'DISMISS_MODAL';
export const SET_IS_SAVING = 'SET_IS_SAVING';
export const SET_MODAL_ERRORS = 'SET_MODAL_ERROR';
export const SET_SELECTED_PRESET = 'SET_SELECTED_PRESET';
export const SAVE_PACKAGE = 'SAVE_PACKAGE';
export const UPDATE_PACKAGES_FIELD = 'UPDATE_PACKAGES_FIELD';
export const TOGGLE_OUTER_DIMENSIONS = 'TOGGLE_OUTER_DIMENSIONS';
export const TOGGLE_ALL = 'TOGGLE_ALL';
export const TOGGLE_PACKAGE = 'TOGGLE_PACKAGE';
export const SET_IS_FETCHING = 'SET_IS_FETCHING';
export const INIT_PACKAGES_FORM = 'INIT_PACKAGES_FORM';

export const addPackage = () => ( {
	type: ADD_PACKAGE,
} );

export const removePackage = ( index ) => ( {
	type: REMOVE_PACKAGE,
	index,
} );

export const editPackage = ( packageToEdit ) => ( {
	type: EDIT_PACKAGE,
	'package': packageToEdit,
} );

export const dismissModal = () => ( {
	type: DISMISS_MODAL,
} );

export const setSelectedPreset = ( value ) => ( {
	type: SET_SELECTED_PRESET,
	value,
} );

export const savePackage = ( packageData ) => ( {
	type: SAVE_PACKAGE,
	packageData,
} );

export const updatePackagesField = ( newValues ) => ( {
	type: UPDATE_PACKAGES_FIELD,
	values: newValues,
} );

export const toggleOuterDimensions = () => ( {
	type: TOGGLE_OUTER_DIMENSIONS,
} );

export const toggleAll = ( serviceId, groupId, checked ) => ( {
	type: TOGGLE_ALL,
	serviceId,
	groupId,
	checked,
} );

export const togglePackage = ( serviceId, packageId ) => ( {
	type: TOGGLE_PACKAGE,
	serviceId,
	packageId,
} );

export const setModalErrors = ( value ) => ( {
	type: SET_MODAL_ERRORS,
	value,
} );

export const setIsSaving = ( isSaving ) => ( {
	type: SET_IS_SAVING,
	isSaving,
} );

export const fetchSettings = () => ( dispatch, getState ) => {
	if ( getState().form.packages || getState().form.isFetching ) {
		return;
	}
	dispatch( { type: SET_IS_FETCHING, isFetching: true } );

	api.get( api.url.packages() )
		.then( ( { formData, formSchema, storeOptions } ) => {
			dispatch( {
				type: INIT_PACKAGES_FORM,
				packages: formData,
				dimensionUnit: storeOptions.dimension_unit,
				weightUnit: storeOptions.weight_unit,
				packageSchema: formSchema.custom.items,
				predefinedSchema: formSchema.predefined,
			} );
		} )
		.catch( ( error ) => {
			console.error( error ); // eslint-disable-line no-console
		} )
		.then( () => dispatch( { type: SET_IS_FETCHING, isFetching: false } ) );
};

export const submit = ( onSaveSuccess, onSaveFailure ) => ( dispatch, getState ) => {
	dispatch( setIsSaving( true ) );
	api.post( api.url.packages(), getState().form.packages )
		.then( onSaveSuccess )
		.catch( onSaveFailure )
		.then( () => dispatch( setIsSaving( false ) ) );
};
