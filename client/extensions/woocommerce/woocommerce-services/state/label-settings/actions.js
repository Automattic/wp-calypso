/**
 * Internal dependencies
 */
import * as api from '../../api';
import { WOOCOMMERCE_SERVICES_LABELS_INIT_FORM, WOOCOMMERCE_SERVICES_LABELS_SET_FORM_DATA_VALUE, WOOCOMMERCE_SERVICES_LABELS_SET_FORM_META_PROPERTY } from '../action-types';
import { getLabelSettingsForm, getLabelSettingsFormData } from './selectors';

export const initForm = ( siteId, storeOptions, formData, formMeta ) => {
	return {
		type: WOOCOMMERCE_SERVICES_LABELS_INIT_FORM,
		siteId,
		storeOptions,
		formData,
		formMeta,
	};
};

export const setFormDataValue = ( siteId, key, value ) => ( {
	type: WOOCOMMERCE_SERVICES_LABELS_SET_FORM_DATA_VALUE,
	siteId,
	key,
	value,
} );

export const setFormMetaProperty = ( siteId, key, value ) => {
	return {
		type: WOOCOMMERCE_SERVICES_LABELS_SET_FORM_META_PROPERTY,
		siteId,
		key,
		value,
	};
};

export const fetchSettings = ( siteId ) => ( dispatch, getState ) => {
	const form = getLabelSettingsForm( getState(), siteId );

	if ( form && ( form.data || form.meta.isFetching ) ) {
		return;
	}
	dispatch( setFormMetaProperty( siteId, 'isFetching', true ) );

	api.get( siteId, api.url.accountSettings )
		.then( ( { storeOptions, formMeta, formData } ) => {
			dispatch( initForm( siteId, storeOptions, formData, formMeta ) );
		} )
		.catch( ( error ) => {
			console.error( error ); // eslint-disable-line no-console
		} )
		.then( () => dispatch( setFormMetaProperty( siteId, 'isFetching', false ) ) );
};

export const submit = ( siteId, onSaveSuccess, onSaveFailure ) => ( dispatch, getState ) => {
	dispatch( setFormMetaProperty( 'isSaving', true ) );
	api.post( siteId, api.url.accountSettings, getLabelSettingsFormData( getState() ) )
		.then( onSaveSuccess )
		.catch( onSaveFailure )
		.then( () => {
			dispatch( setFormMetaProperty( 'isSaving', false ) );
			dispatch( setFormMetaProperty( 'pristine', true ) );
		} );
};
