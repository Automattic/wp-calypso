import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
	requestSiteSettings,
	saveSiteSettings,
	updateSiteSettings,
} from 'calypso/state/site-settings/actions';
import {
	getSiteSettings,
	isSiteSettingsSaveSuccessful,
} from 'calypso/state/site-settings/selectors';

// WooCommerce enable options.
export const WOOCOMMERCE_STORE_ADDRESS_1 = 'woocommerce_store_address';
export const WOOCOMMERCE_STORE_ADDRESS_2 = 'woocommerce_store_address_2';
export const WOOCOMMERCE_STORE_CITY = 'woocommerce_store_city';
export const WOOCOMMERCE_DEFAULT_COUNTRY = 'woocommerce_default_country';
export const WOOCOMMERCE_STORE_POSTCODE = 'woocommerce_store_postcode';
export const WOOCOMMERCE_ONBOARDING_PROFILE = 'woocommerce_onboarding_profile';

export type optionNameType =
	| 'blog_public'
	| typeof WOOCOMMERCE_STORE_ADDRESS_1
	| typeof WOOCOMMERCE_STORE_ADDRESS_2
	| typeof WOOCOMMERCE_STORE_CITY
	| typeof WOOCOMMERCE_DEFAULT_COUNTRY
	| typeof WOOCOMMERCE_STORE_POSTCODE
	| typeof WOOCOMMERCE_ONBOARDING_PROFILE;

type OptionValueType = Record< string, unknown > | string;

/**
 * Simple react custom hook to deal with site settings.
 *
 * @param {number} siteId - site id
 * @returns {Array} - site option handlers
 */
export function useSiteSettings( siteId: number ) {
	const dispatch = useDispatch();

	const settings = useSelector( ( state ) => getSiteSettings( state, siteId ) );
	const settingsSaved = useSelector( ( state ) => isSiteSettingsSaveSuccessful( state, siteId ) );

	const [ updates, setUpdates ] = useState( {} as Record< optionNameType, OptionValueType > );

	// Dispatch action to request the site settings.
	useEffect( () => {
		if ( ! siteId ) {
			return;
		}

		dispatch( requestSiteSettings( siteId ) );
	}, [ dispatch, siteId, settingsSaved ] );

	/**
	 * Simple getter function.
	 *
	 * @todo The any return type was inferred in the original code because of an
	 * invalid JSDoc type. Once that type was fixed, we had to hardcode "any" in
	 * order to avoid the errors that got hidden. See below for more details.
	 * @see https://github.com/Automattic/wp-calypso/pull/59970/files#r1083218153
	 * @param option The option type.
	 * @returns The option value.
	 */
	function get( option: optionNameType ): any {
		if ( updates[ option ] ) {
			return updates[ option ];
		}

		if ( ! settings || Object.keys( settings ).length === 0 ) {
			return '';
		}

		return settings[ option ] || '';
	}

	/*
	 * Helper to 'update' site settings data.
	 * Changes are applied to the Redux store.
	 */
	const update = useCallback(
		( option: optionNameType, value: OptionValueType ) => {
			updates[ option ] = value;
			setUpdates( updates );

			// Store the edited option in the private store.
			dispatch( updateSiteSettings( siteId, { [ option ]: value } ) );
		},
		[ siteId, dispatch, updates ]
	);

	/*
	 * Helper to 'save' site settings data.
	 * The data will be saved to the remote server.
	 */
	const save = useCallback( () => {
		dispatch( saveSiteSettings( siteId, updates ) );
	}, [ dispatch, updates, siteId ] );

	return { save, update, get };
}
