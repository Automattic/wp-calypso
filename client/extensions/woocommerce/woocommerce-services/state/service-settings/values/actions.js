/**
 * External dependencies
 */
import _ from 'lodash';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import * as api from 'woocommerce/woocommerce-services/api';
import coerceFormValues from 'woocommerce/woocommerce-services/lib/utils/coerce-values';
import * as FormActions from '../actions';
import * as NoticeActions from 'state/notices/actions';
import getFormErrors, { EMPTY_ERROR } from '../selectors/errors';

export const UPDATE_FIELD = 'UPDATE_FIELD';
export const REMOVE_FIELD = 'REMOVE_FIELD';
export const ADD_ARRAY_FIELD_ITEM = 'ADD_ARRAY_FIELD_ITEM';

export const updateField = ( path, value ) => ( {
	type: UPDATE_FIELD,
	path,
	value,
} );

export const removeField = ( path ) => ( {
	type: REMOVE_FIELD,
	path,
} );

export const addArrayFieldItem = ( path, item ) => ( {
	type: ADD_ARRAY_FIELD_ITEM,
	path,
	item,
} );

export const submit = ( schema, silent ) => ( dispatch, getState, { methodId, instanceId } ) => {
	silent = ( true === silent );

	const setIsSaving = ( value ) => dispatch( FormActions.setFormProperty( 'isSaving', value ) );

	const setSuccess = ( value ) => {
		dispatch( FormActions.setFormProperty( 'success', value ) );
		if ( ! silent && true === value ) {
			dispatch( NoticeActions.successNotice( translate( 'Your changes have been saved.' ), {
				duration: 5000,
			} ) );
		}
	};

	const setFieldsStatus = ( value ) => {
		dispatch( FormActions.setFormProperty( 'fieldsStatus', value ) );

		if ( ! silent ) {
			dispatch( NoticeActions.errorNotice( translate( 'There was a problem with one or more entries. ' +
				'Please fix the errors below and try saving again.' ) ) );
		}
	};

	const setError = ( value ) => {
		dispatch( FormActions.setFormProperty( 'error', value ) );

		if ( 'rest_cookie_invalid_nonce' !== value && ! silent ) {
			if ( _.isString( value ) ) {
				dispatch( NoticeActions.errorNotice( value ) );
			}

			if ( _.isObject( value ) ) {
				dispatch( NoticeActions.errorNotice( translate( 'There was a problem with one or more entries. ' +
					'Please fix the errors below and try saving again.' ) ) );
			}
		}
	};

	const coercedValues = coerceFormValues( schema, getState().form.values );

	// Trigger a client-side validation before hitting the server
	dispatch( FormActions.setAllPristine( false ) );

	const errors = getFormErrors( getState(), schema );
	if ( ! _.isEmpty( errors ) ) {
		setError( errors );
		return;
	}

	setIsSaving( true );
	api.post( api.url.serviceSettings( methodId, instanceId ), coercedValues )
		.then( () => setSuccess( true ) )
		.catch( ( error ) => {
			if ( 'validation_failure' === _.get( error, 'data.error' ) && _.get( error, 'data.data.fields' ) ) {
				let fieldsStatus = error.data.data.fields;
				// Some services still give the field errors in an array, keep backwards-compatibility
				if ( _.isArray( fieldsStatus ) ) {
					fieldsStatus = {};
					error.data.data.fields.forEach( ( fieldName ) => fieldsStatus[ fieldName ] = EMPTY_ERROR );
				}
				return setFieldsStatus( fieldsStatus );
			}

			setError( error );
		} )
		.then( () => setIsSaving( false ) );
};
