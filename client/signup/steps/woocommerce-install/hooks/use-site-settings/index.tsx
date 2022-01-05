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
 * Returns the option name for the given WooCommerce option.
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
 * Simple react custom hook to deal with site settings.
 *
 * @param {number} siteId - site id
 * @returns {Array} - site option handlers
 */
export function useSiteSettings( siteId: number ) {
	const dispatch = useDispatch();

	const settings = useSelector( ( state ) => getSiteSettings( state, siteId ) );

	/*
	 * Private settings store.
	 * It collects the options that will be updated/saved
	 */
	const [ editedSettings, setEditedSettings ] = useState( {} );

	// Dispatch action to request the site settings.
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
	 * Chnages are applied to the Redux store.
	 */
	const update = useCallback(
		( option: string, value: string ) => {
			const siteOption = getSiteOptionName( option );
			setEditedSettings( ( state ) => ( { ...state, [ siteOption ]: value } ) );

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
		if ( ! editedSettings || ! Object.keys( editedSettings ).length ) {
			return;
		}

		/*
		 * Save the edited options to the server.
		 * After the save is complete, clean the private store.
		 */
		dispatch( saveSiteSettings( siteId, editedSettings ) );
		setEditedSettings( {} );
	}, [ dispatch, editedSettings, siteId ] );

	return { save, update, get };
}
