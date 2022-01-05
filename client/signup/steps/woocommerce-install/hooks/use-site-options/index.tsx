import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
	requestSiteSettings,
	saveSiteSettings,
	updateSiteSettings,
} from 'calypso/state/site-settings/actions';
import { getSiteSettings } from 'calypso/state/site-settings/selectors';

// WooCommerce single options.
export const WOOCOMMERCE_STORE_ADDRESS_1 = 'woocommerce_store_address';
export const WOOCOMMERCE_STORE_ADDRESS_2 = 'woocommerce_store_address_2';
export const WOOCOMMERCE_STORE_CITY = 'woocommerce_store_city';
export const WOOCOMMERCE_DEFAULT_COUNTRY = 'woocommerce_default_country';
export const WOOCOMMERCE_STORE_POSTCODE = 'woocommerce_store_postcode';

// Map Woop to WooCoommerce single options.
const siteOptionsMap = {
	address_1: WOOCOMMERCE_STORE_ADDRESS_1,
	address_2: WOOCOMMERCE_STORE_ADDRESS_2,
	city: WOOCOMMERCE_STORE_CITY,
	postcode: WOOCOMMERCE_STORE_POSTCODE,
	country: WOOCOMMERCE_DEFAULT_COUNTRY,
};

/**
 * Returns the option name for the given Woop option.
 *
 * @param {string} option option name
 * @returns {string} option
 */
function getSiteOptionName( option: string ) {
	if ( ! ( option in siteOptionsMap ) ) {
		return option;
	}

	return siteOptionsMap[ option ];
}

/**
 * React custom hook to deal with single site options.
 *
 * @param {number} siteId - site id
 * @returns {Array} - site option handlers
 */
export function useSiteOption( siteId: number ) {
	const dispatch = useDispatch();

	const settings = useSelector( ( state ) => getSiteSettings( state, siteId ) );

	// Private options store.
	const [ editedOptions, setEditedOptions ] = useState( {} );

	// Dispatch the site settings request action.
	useEffect( () => {
		if ( ! siteId ) {
			return;
		}

		dispatch( requestSiteSettings( siteId ) );
	}, [ dispatch, siteId ] );

	// Simple getter helper.
	function get( option: string ) {
		if ( ! settings || Object.keys( settings ).length === 0 ) {
			return '';
		}

		const value = settings?.[ getSiteOptionName( option ) ] || '';
		return value;
	}

	/*
	 * Helper to 'update' site settings data.
	 * The data is updated in the Redux store.
	 */
	const update = useCallback(
		( option: string, value: string ) => {
			const siteOption = getSiteOptionName( option );
			setEditedOptions( ( state ) => ( { ...state, [ siteOption ]: value } ) );

			// Store the edited option in the private store.
			dispatch( updateSiteSettings( siteId, { [ siteOption ]: value } ) );
		},
		[ siteId, dispatch ]
	);

	/*
	 * Helper to 'save' site settings data.
	 * The data will be saved to the remote server.
	 */
	const save = useCallback( () => {
		if ( ! editedOptions || ! Object.keys( editedOptions ).length ) {
			return;
		}

		/*
		 * Save the edited options to the server.
		 * After the save is complete, clean the private store.
		 */
		dispatch( saveSiteSettings( siteId, editedOptions ) );
		setEditedOptions( {} );
	}, [ dispatch, editedOptions, siteId ] );

	return { save, update, get };
}
