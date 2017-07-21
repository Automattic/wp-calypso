/**
 * Internal dependencies
 */
import * as api from '../../api';
import { getLabelSettingsForm } from './selectors';

export const INIT_FORM = 'INIT_FORM';

export const initForm = ( siteId, storeOptions, formData, formMeta ) => {
	return {
		type: INIT_FORM,
		siteId,
		storeOptions,
		formData,
		formMeta,
	};
};

// SET_FORM_DATA_VALUE is used to update a form field's underlying setting, e.g. selected_payment_method_id
export const SET_FORM_DATA_VALUE = 'SET_FORM_DATA_VALUE';

export const setFormDataValue = ( siteId, key, value ) => ( {
	type: SET_FORM_DATA_VALUE,
	siteId,
	key,
	value,
} );

// SET_FORM_META_PROPERTY is used to update the form state, e.g. isSaving or success
export const SET_FORM_META_PROPERTY = 'SET_FORM_META_PROPERTY';

export const setFormMetaProperty = ( siteId, key, value ) => {
	return {
		type: SET_FORM_META_PROPERTY,
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

	api.get( siteId, api.url.accountSettings() )
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
	api.post( siteId, api.url.accountSettings(), getState().form.data )
		.then( onSaveSuccess )
		.catch( onSaveFailure )
		.then( () => dispatch( setFormMetaProperty( 'isSaving', false ) ) );
};
