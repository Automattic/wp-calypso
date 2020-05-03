/**
 * Internal dependencies
 */
import * as api from '../../api';
import {
	WOOCOMMERCE_SERVICES_PACKAGES_ADD_PACKAGE,
	WOOCOMMERCE_SERVICES_PACKAGES_REMOVE_PACKAGE,
	WOOCOMMERCE_SERVICES_PACKAGES_EDIT_PACKAGE,
	WOOCOMMERCE_SERVICES_PACKAGES_DISMISS_MODAL,
	WOOCOMMERCE_SERVICES_PACKAGES_SET_IS_SAVING,
	WOOCOMMERCE_SERVICES_PACKAGES_SET_MODAL_ERRORS,
	WOOCOMMERCE_SERVICES_PACKAGES_UPDATE_PACKAGES_FIELD,
	WOOCOMMERCE_SERVICES_PACKAGES_REMOVE_PREDEFINED,
	WOOCOMMERCE_SERVICES_PACKAGES_SAVE_PREDEFINED,
	WOOCOMMERCE_SERVICES_PACKAGES_SAVE_PACKAGE,
	WOOCOMMERCE_SERVICES_PACKAGES_TOGGLE_OUTER_DIMENSIONS,
	WOOCOMMERCE_SERVICES_PACKAGES_TOGGLE_ALL_PREDEFINED,
	WOOCOMMERCE_SERVICES_PACKAGES_TOGGLE_PREDEFINED,
	WOOCOMMERCE_SERVICES_PACKAGES_SET_ADD_MODE,
	WOOCOMMERCE_SERVICES_PACKAGES_SET_IS_FETCH_ERROR,
	WOOCOMMERCE_SERVICES_PACKAGES_SET_IS_FETCHING,
	WOOCOMMERCE_SERVICES_PACKAGES_INIT_PACKAGES_FORM,
} from '../action-types';
import { getPackagesForm } from './selectors';

export const addPackage = ( siteId ) => ( {
	type: WOOCOMMERCE_SERVICES_PACKAGES_ADD_PACKAGE,
	siteId,
} );

export const removePackage = ( siteId, index ) => ( {
	type: WOOCOMMERCE_SERVICES_PACKAGES_REMOVE_PACKAGE,
	index,
	siteId,
} );

export const editPackage = ( siteId, packageToEdit ) => ( {
	type: WOOCOMMERCE_SERVICES_PACKAGES_EDIT_PACKAGE,
	package: packageToEdit,
	siteId,
} );

export const dismissModal = ( siteId ) => ( {
	type: WOOCOMMERCE_SERVICES_PACKAGES_DISMISS_MODAL,
	siteId,
} );

export const savePackage = ( siteId, packageData ) => ( {
	type: WOOCOMMERCE_SERVICES_PACKAGES_SAVE_PACKAGE,
	packageData,
	siteId,
} );

export const updatePackagesField = ( siteId, newValues ) => ( {
	type: WOOCOMMERCE_SERVICES_PACKAGES_UPDATE_PACKAGES_FIELD,
	values: newValues,
	siteId,
} );

export const toggleOuterDimensions = ( siteId ) => ( {
	type: WOOCOMMERCE_SERVICES_PACKAGES_TOGGLE_OUTER_DIMENSIONS,
	siteId,
} );

export const toggleAll = ( siteId, serviceId, groupId, checked ) => ( {
	type: WOOCOMMERCE_SERVICES_PACKAGES_TOGGLE_ALL_PREDEFINED,
	serviceId,
	groupId,
	checked,
	siteId,
} );

export const togglePackage = ( siteId, serviceId, packageId ) => ( {
	type: WOOCOMMERCE_SERVICES_PACKAGES_TOGGLE_PREDEFINED,
	serviceId,
	packageId,
	siteId,
} );

export const savePredefinedPackages = ( siteId ) => ( {
	type: WOOCOMMERCE_SERVICES_PACKAGES_SAVE_PREDEFINED,
	siteId,
} );

export const removePredefinedPackage = ( siteId, serviceId, packageId ) => ( {
	type: WOOCOMMERCE_SERVICES_PACKAGES_REMOVE_PREDEFINED,
	serviceId,
	packageId,
	siteId,
} );

export const setModalErrors = ( siteId, value ) => ( {
	type: WOOCOMMERCE_SERVICES_PACKAGES_SET_MODAL_ERRORS,
	value,
	siteId,
} );

export const setIsSaving = ( siteId, isSaving ) => ( {
	type: WOOCOMMERCE_SERVICES_PACKAGES_SET_IS_SAVING,
	isSaving,
	siteId,
} );

export const setIsFetching = ( siteId, isFetching ) => ( {
	type: WOOCOMMERCE_SERVICES_PACKAGES_SET_IS_FETCHING,
	isFetching,
	siteId,
} );

export const setIsFetchError = ( siteId, isFetchError ) => ( {
	type: WOOCOMMERCE_SERVICES_PACKAGES_SET_IS_FETCH_ERROR,
	isFetchError,
	siteId,
} );

export const setAddMode = ( siteId, mode ) => ( {
	type: WOOCOMMERCE_SERVICES_PACKAGES_SET_ADD_MODE,
	siteId,
	mode,
} );

export const fetchSettings = ( siteId ) => ( dispatch, getState ) => {
	const form = getPackagesForm( getState(), siteId );

	if ( form && ( form.packages || form.isFetching ) ) {
		return;
	}
	dispatch( setIsFetching( siteId, true ) );

	api
		.get( siteId, api.url.packages )
		.then( ( { formData, formSchema, storeOptions } ) => {
			dispatch( {
				type: WOOCOMMERCE_SERVICES_PACKAGES_INIT_PACKAGES_FORM,
				packages: formData,
				dimensionUnit: storeOptions.dimension_unit,
				weightUnit: storeOptions.weight_unit,
				packageSchema: formSchema.custom.items,
				predefinedSchema: formSchema.predefined,
				siteId,
			} );
		} )
		.catch( ( error ) => {
			//TODO: add better error handling
			console.error( error ); // eslint-disable-line no-console
			dispatch( setIsFetchError( siteId, true ) );
		} )
		.then( () => dispatch( setIsFetching( siteId, false ) ) );
};

export const submit = ( siteId, onSaveSuccess, onSaveFailure ) => ( dispatch, getState ) => {
	const form = getPackagesForm( getState(), siteId );
	dispatch( setIsSaving( siteId, true ) );
	api
		.post( siteId, api.url.packages, form.packages )
		.then( onSaveSuccess )
		.catch( onSaveFailure )
		.then( () => dispatch( setIsSaving( siteId, false ) ) );
};
