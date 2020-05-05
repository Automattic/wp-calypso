/**
 * Internal dependencies
 */

import { areSetupChoicesLoaded, areSetupChoicesLoading } from './selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import request from 'woocommerce/state/sites/request';
import { setError } from '../status/wc-api/actions';
import {
	WOOCOMMERCE_SETUP_CHOICE_UPDATE_REQUEST,
	WOOCOMMERCE_SETUP_CHOICE_UPDATE_REQUEST_SUCCESS,
	WOOCOMMERCE_SETUP_CHOICES_REQUEST,
	WOOCOMMERCE_SETUP_CHOICES_REQUEST_SUCCESS,
	WOOCOMMERCE_SETUP_STORE_PAGES_REQUEST,
} from 'woocommerce/state/action-types';
import wp from 'lib/wp';

export const fetchSetupChoices = ( siteId ) => ( dispatch, getState ) => {
	if ( areSetupChoicesLoading( getState(), siteId ) ) {
		return;
	}

	if ( areSetupChoicesLoaded( getState(), siteId ) ) {
		return;
	}

	const getAction = {
		type: WOOCOMMERCE_SETUP_CHOICES_REQUEST,
		siteId,
	};

	dispatch( getAction );

	return wp.req
		.get( { path: `/sites/${ siteId }/calypso-preferences/woocommerce` } )
		.then( ( data ) => {
			dispatch( {
				type: WOOCOMMERCE_SETUP_CHOICES_REQUEST_SUCCESS,
				siteId,
				data,
			} );
		} )
		.catch( ( err ) => {
			dispatch( setError( siteId, getAction, err ) );
		} );
};

const updateSetupChoice = ( dispatch, siteId, key, value ) => {
	const postAction = {
		type: WOOCOMMERCE_SETUP_CHOICE_UPDATE_REQUEST,
		siteId,
		key,
		value,
	};

	dispatch( postAction );

	const postData = {
		path: `/sites/${ siteId }/calypso-preferences/woocommerce`,
		body: { [ key ]: value },
	};

	return wp.req
		.post( postData )
		.then( ( data ) => {
			dispatch( {
				type: WOOCOMMERCE_SETUP_CHOICE_UPDATE_REQUEST_SUCCESS,
				siteId,
				data,
			} );
		} )
		.catch( ( err ) => {
			dispatch( setError( siteId, postAction, err ) );
		} );
};

export const setFinishedInitialSetup = ( siteId, value ) => ( dispatch ) => {
	return updateSetupChoice( dispatch, siteId, 'finished_initial_setup', value );
};

export const setOptedOutOfShippingSetup = ( siteId, value ) => ( dispatch ) => {
	return updateSetupChoice( dispatch, siteId, 'opted_out_of_shipping_setup', value );
};

export const setOptedOutOfTaxesSetup = ( siteId, value ) => ( dispatch ) => {
	return updateSetupChoice( dispatch, siteId, 'opted_out_of_taxes_setup', value );
};

export const setTriedCustomizerDuringInitialSetup = ( siteId, value ) => ( dispatch ) => {
	return updateSetupChoice( dispatch, siteId, 'tried_customizer_during_initial_setup', value );
};

export const setCreatedDefaultShippingZone = ( siteId, value ) => ( dispatch ) => {
	return updateSetupChoice( dispatch, siteId, 'created_default_shipping_zone', value );
};

export const setCheckedTaxSetup = ( siteId, value ) => ( dispatch ) => {
	return updateSetupChoice( dispatch, siteId, 'checked_tax_setup', value );
};

export const setFinishedInstallOfRequiredPlugins = ( siteId, value ) => ( dispatch ) => {
	return updateSetupChoice(
		dispatch,
		siteId,
		'finished_initial_install_of_required_plugins',
		value
	);
};

export const setSetStoreAddressDuringInitialSetup = ( siteId, value ) => ( dispatch ) => {
	return updateSetupChoice( dispatch, siteId, 'set_store_address_during_initial_setup', value );
};

export const setUpStorePages = ( siteId ) => ( dispatch, getState ) => {
	const state = getState();
	if ( ! siteId ) {
		siteId = getSelectedSiteId( state );
	}

	const action = {
		type: WOOCOMMERCE_SETUP_STORE_PAGES_REQUEST,
		siteId,
	};

	dispatch( action );

	return request( siteId )
		.post( 'system_status/tools/install_pages' )
		.then( () => {
			updateSetupChoice( dispatch, siteId, 'finished_page_setup', true );
		} )
		.catch( ( err ) => {
			dispatch( setError( siteId, action, err ) );
		} );
};
