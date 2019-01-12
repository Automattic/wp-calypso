/** @format */
/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import * as api from '../../api';
import {
	WOOCOMMERCE_SERVICES_LABELS_INIT_FORM,
	WOOCOMMERCE_SERVICES_LABELS_RESTORE_PRISTINE,
	WOOCOMMERCE_SERVICES_LABELS_SET_FORM_DATA_VALUE,
	WOOCOMMERCE_SERVICES_LABELS_SET_FORM_META_PROPERTY,
	WOOCOMMERCE_SERVICES_LABELS_OPEN_ADD_CARD_DIALOG,
	WOOCOMMERCE_SERVICES_LABELS_CLOSE_ADD_CARD_DIALOG,
} from '../action-types';
import { plainNotice } from 'state/notices/actions';
import { getLabelSettingsFormData } from './selectors';

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

export const fetchSettings = siteId => ( dispatch, getState ) => {
	dispatch( setFormMetaProperty( siteId, 'isFetching', true ) );

	api
		.get( siteId, api.url.accountSettings )
		.then( ( { storeOptions, formMeta, formData } ) => {
			const previousFormData = getLabelSettingsFormData( getState(), siteId );
			dispatch( initForm( siteId, storeOptions, formData, formMeta ) );

			if ( previousFormData && previousFormData.selected_payment_method_id !== formData.selected_payment_method_id ) {
				dispatch( plainNotice( translate( 'Your payment method has been saved.' ), { duration: 5000 } ) );
			}
		} )
		.catch( error => {
			dispatch( setFormMetaProperty( siteId, 'isFetchError', true ) );
			console.error( error ); // eslint-disable-line no-console
		} )
		.then( () => dispatch( setFormMetaProperty( siteId, 'isFetching', false ) ) );
};

export const submit = ( siteId, onSaveSuccess, onSaveFailure ) => ( dispatch, getState ) => {
	dispatch( setFormMetaProperty( siteId, 'isSaving', true ) );
	dispatch( setFormMetaProperty( siteId, 'pristine', true ) );
	api
		.post( siteId, api.url.accountSettings, getLabelSettingsFormData( getState(), siteId ) )
		.then( onSaveSuccess )
		.catch( err => {
			dispatch( setFormMetaProperty( siteId, 'pristine', false ) );
			return onSaveFailure( err );
		} )
		.then( () => {
			dispatch( setFormMetaProperty( siteId, 'isSaving', false ) );
		} );
};

export const restorePristineSettings = siteId => {
	return {
		type: WOOCOMMERCE_SERVICES_LABELS_RESTORE_PRISTINE,
		siteId,
	};
};

export const openAddCardDialog = siteId => {
	return { type: WOOCOMMERCE_SERVICES_LABELS_OPEN_ADD_CARD_DIALOG, siteId };
};

export const closeAddCardDialog = siteId => {
	return { type: WOOCOMMERCE_SERVICES_LABELS_CLOSE_ADD_CARD_DIALOG, siteId };
};
