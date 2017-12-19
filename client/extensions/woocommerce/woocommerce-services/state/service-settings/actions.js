/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import * as api from 'woocommerce/woocommerce-services/api';
import * as NoticeActions from 'state/notices/actions';
export const INIT_FORM = 'INIT_FORM';
export const SET_FORM_PROPERTY = 'SET_FORM_PROPERTY';
export const SET_ALL_PRISTINE = 'SET_ALL_PRISTINE';

const initForm = ( form ) => {
	return {
		type: INIT_FORM,
		...form,
	};
};

export const setFormProperty = ( field, value ) => {
	return {
		type: SET_FORM_PROPERTY,
		field,
		value,
	};
};

export const fetchForm = () => ( dispatch, getState, { methodId, instanceId } ) => {
	dispatch( setFormProperty( 'isFetching', true ) );
	return api.get( api.url.serviceSettings( methodId, instanceId ) )
		.then( ( response ) => {
			dispatch( initForm( response ) );
		} )
		.catch( () => {
			NoticeActions.errorNotice( translate( 'Error while loading the settings. Please refresh the page to try again.' ) );
			dispatch( setFormProperty( 'fetchError', false ) );
		} )
		.then( () => {
			dispatch( setFormProperty( 'isFetching', false ) );
		} );
};

export const setAllPristine = ( pristineValue ) => ( {
	type: SET_ALL_PRISTINE,
	pristineValue,
} );
