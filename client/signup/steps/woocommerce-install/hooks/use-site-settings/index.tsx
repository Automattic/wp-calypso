import { uniqueBy } from '@automattic/js-utils';
import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
	requestSiteSettings,
	saveSiteSettings,
	updateSiteSettings,
} from 'calypso/state/site-settings/actions';
import { getSiteSettings } from 'calypso/state/site-settings/selectors';

// WooCommerce enable options.
export const WOOCOMMERCE_STORE_ADDRESS_1 = 'woocommerce_store_address';
export const WOOCOMMERCE_STORE_ADDRESS_2 = 'woocommerce_store_address_2';
export const WOOCOMMERCE_STORE_CITY = 'woocommerce_store_city';
export const WOOCOMMERCE_DEFAULT_COUNTRY = 'woocommerce_default_country';
export const WOOCOMMERCE_STORE_POSTCODE = 'woocommerce_store_postcode';
export const WOOCOMMERCE_ONBOARDING_PROFILE = 'woocommerce_onboarding_profile';

type optionNameType =
	| 'blog_public'
	| typeof WOOCOMMERCE_STORE_ADDRESS_1
	| typeof WOOCOMMERCE_STORE_ADDRESS_2
	| typeof WOOCOMMERCE_STORE_CITY
	| typeof WOOCOMMERCE_DEFAULT_COUNTRY
	| typeof WOOCOMMERCE_STORE_POSTCODE
	| typeof WOOCOMMERCE_ONBOARDING_PROFILE;

type OptionObjectType = Record< string, unknown >;

type OptionValueType = string | number | Array< string | number > | OptionObjectType | undefined;

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
	const [ editedSettings, setEditedSettings ] = useState( [] as optionNameType[] );

	// Dispatch action to request the site settings.
	useEffect( () => {
		if ( ! siteId ) {
			return;
		}

		dispatch( requestSiteSettings( siteId ) );
	}, [ dispatch, siteId ] );

	// Simple getter helper.
	function get( option: optionNameType ): OptionValueType {
		if ( ! settings || Object.keys( settings ).length === 0 ) {
			return '';
		}

		return settings[ option ];
	}

	/*
	 * Helper to 'update' site settings data.
	 * Changes are applied to the Redux store.
	 */
	const update = useCallback(
		( option: optionNameType, value: OptionValueType ) => {
			setEditedSettings( ( state ) => uniqueBy( [ ...state, option ] ) );

			// Store the edited option in the private store.
			dispatch( updateSiteSettings( siteId, { [ option ]: value } ) );
		},
		[ siteId, dispatch ]
	);

	/*
	 * Helper to 'save' site settings data.
	 * The data will be saved to the remote server.
	 */
	const save = useCallback( () => {
		if ( ! editedSettings || ! editedSettings.length ) {
			return;
		}

		/*
		 * Save the edited options to the server.
		 * After the save is complete, clean the private store.
		 */
		const newSettings = editedSettings.reduce(
			( acc, settingKey ) => ( { ...acc, [ settingKey ]: settings[ settingKey ] } ),
			{}
		);

		dispatch( saveSiteSettings( siteId, newSettings ) );
		setEditedSettings( [] );
	}, [ dispatch, editedSettings, settings, siteId ] );

	return { save, update, get };
}
