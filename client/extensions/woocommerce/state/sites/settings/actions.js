/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'state/ui/selectors';
import request from 'woocommerce/state/sites/request';
import { setError } from '../status/wc-api/actions';
import {
	WOOCOMMERCE_SETTINGS_BATCH_REQUEST,
	WOOCOMMERCE_SETTINGS_BATCH_REQUEST_SUCCESS,
} from 'woocommerce/state/action-types';

const doInitialSetupSuccess = ( siteId, data ) => {
	return {
		type: WOOCOMMERCE_SETTINGS_BATCH_REQUEST_SUCCESS,
		siteId,
		data,
	};
};

export const doInitialSetup = (
	siteId,
	street,
	street2,
	city,
	stateOrProvince,
	postcode,
	country,
	settings,
	successAction,
	failureAction
) => ( dispatch, getState ) => {
	const state = getState();
	if ( ! siteId ) {
		siteId = getSelectedSiteId( state );
	}
	const updateAction = {
		type: WOOCOMMERCE_SETTINGS_BATCH_REQUEST,
		siteId,
	};

	dispatch( updateAction );

	// If a state is given (e.g. CT), combine it with the country (e.g. US)
	// to create the appropriate value for woocommerce_default_country (e.g. US:CT)
	const countryState = stateOrProvince ? country + ':' + stateOrProvince : country;

	let update = [
		{
			group_id: 'general',
			id: 'woocommerce_store_address',
			value: street,
		},
		{
			group_id: 'general',
			id: 'woocommerce_store_address_2',
			value: street2,
		},
		{
			group_id: 'general',
			id: 'woocommerce_store_city',
			value: city,
		},
		{
			group_id: 'general',
			id: 'woocommerce_default_country',
			value: countryState,
		},
		{
			group_id: 'general',
			id: 'woocommerce_store_postcode',
			value: postcode,
		},
	];

	// TODO Only enable taxes when applicable
	update = update.concat( [
		{
			group_id: 'general',
			id: 'woocommerce_calc_taxes',
			value: 'yes',
		},
	] );

	if ( settings.currency_code ) {
		update.push( {
			group_id: 'general',
			id: 'woocommerce_currency',
			value: settings.currency_code,
		} );
	}

	if ( settings.currency_pos ) {
		update.push( {
			group_id: 'general',
			id: 'woocommerce_currency_pos',
			value: settings.currency_pos,
		} );
	}

	if ( settings.decimal_sep ) {
		update.push( {
			group_id: 'general',
			id: 'woocommerce_price_decimal_sep',
			value: settings.decimal_sep,
		} );
	}

	if ( settings.num_decimals ) {
		update.push( {
			group_id: 'general',
			id: 'woocommerce_price_num_decimals',
			value: settings.num_decimals,
		} );
	}

	if ( settings.thousand_sep ) {
		update.push( {
			group_id: 'general',
			id: 'woocommerce_price_thousand_sep',
			value: settings.thousand_sep,
		} );
	}

	if ( settings.dimension_unit ) {
		update.push( {
			group_id: 'products',
			id: 'woocommerce_dimension_unit',
			value: settings.dimension_unit,
		} );
	}

	if ( settings.weight_unit ) {
		update = update.concat( [
			{
				group_id: 'products',
				id: 'woocommerce_weight_unit',
				value: settings.weight_unit,
			},
		] );
	}

	return request( siteId )
		.post( 'settings/batch', { update } )
		.then( ( data ) => {
			dispatch( doInitialSetupSuccess( siteId, data ) );
			if ( successAction ) {
				dispatch( successAction( data ) );
			}
		} )
		.catch( ( err ) => {
			dispatch( setError( siteId, updateAction, err ) );
			if ( failureAction ) {
				dispatch( failureAction( err ) );
			}
		} );
};

const setAddressSuccess = ( siteId, data ) => {
	return {
		type: WOOCOMMERCE_SETTINGS_BATCH_REQUEST_SUCCESS,
		siteId,
		data,
	};
};

export const setAddress = (
	siteId,
	street,
	street2,
	city,
	stateOrProvince,
	postcode,
	country,
	successAction,
	failureAction
) => ( dispatch, getState ) => {
	const state = getState();
	if ( ! siteId ) {
		siteId = getSelectedSiteId( state );
	}
	const updateAction = {
		type: WOOCOMMERCE_SETTINGS_BATCH_REQUEST,
		siteId,
	};

	dispatch( updateAction );

	// If a state is given (e.g. CT), combine it with the country (e.g. US)
	// to create the appropriate value for woocommerce_default_country (e.g. US:CT)
	const countryState = stateOrProvince ? country + ':' + stateOrProvince : country;
	const update = [
		{
			group_id: 'general',
			id: 'woocommerce_store_address',
			value: street,
		},
		{
			group_id: 'general',
			id: 'woocommerce_store_address_2',
			value: street2,
		},
		{
			group_id: 'general',
			id: 'woocommerce_store_city',
			value: city,
		},
		{
			group_id: 'general',
			id: 'woocommerce_default_country',
			value: countryState,
		},
		{
			group_id: 'general',
			id: 'woocommerce_store_postcode',
			value: postcode,
		},
	];

	return request( siteId )
		.post( 'settings/batch', { update } )
		.then( ( data ) => {
			dispatch( setAddressSuccess( siteId, data ) );
			if ( successAction ) {
				dispatch( successAction( data ) );
			}
		} )
		.catch( ( err ) => {
			dispatch( setError( siteId, updateAction, err ) );
			if ( failureAction ) {
				dispatch( failureAction( err ) );
			}
		} );
};
