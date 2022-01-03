import { useCallback, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
	requestSiteSettings,
	saveSiteSettings,
	updateSiteSettings,
} from 'calypso/state/site-settings/actions';
import { getSiteSettings } from 'calypso/state/site-settings/selectors';

const STORE_ADDRESS_OPTION_NAME = 'store_address';

export default function useSiteOptions( siteId: number, optionId: string ) {
	const dispatch = useDispatch();

	const settings = useSelector( ( state ) => getSiteSettings( state, siteId ) );

	// Dispatch the site settings request action.
	useEffect( () => {
		if ( ! siteId ) {
			return;
		}

		dispatch( requestSiteSettings( siteId ) );
	}, [ dispatch, siteId ] );

	// Get site settings data (from remote).
	const siteSettingsData = useMemo( () => {
		return settings?.[ optionId ] || {};
	}, [ optionId, settings ] );

	// Simple getter helper.
	function get( key: string ) {
		return siteSettingsData?.[ key ] || '';
	}

	/*
	 * Helper to 'update' site settings data.
	 * The data is updated in the Redux store.
	 */
	const update = useCallback(
		( data: object ) => {
			const key = Object.keys( data )[ 0 ];
			if ( ! key ) {
				return;
			}

			const newSiteSettingsData = { ...siteSettingsData, ...data };

			const value = data[ key ];

			// Remove the key when its value is an empty string.
			if ( typeof value === 'string' && value.length === 0 ) {
				delete newSiteSettingsData[ key ];
			}

			dispatch( updateSiteSettings( siteId, { [ optionId ]: newSiteSettingsData } ) );
		},
		[ optionId, siteId, dispatch, siteSettingsData ]
	);

	/*
	 * Helper to 'save' site settings data.
	 * The data will be saved to the remote server.
	 */
	const save = useCallback(
		() => dispatch( saveSiteSettings( siteId, { [ optionId ]: siteSettingsData } ) ),
		[ dispatch, optionId, siteId, siteSettingsData ]
	);

	// Clean the site option value from the store.
	const clean = () => dispatch( updateSiteSettings( siteId, { [ optionId ]: {} } ) );

	return { data: siteSettingsData, save, clean, update, get };
}

export function useStoreAddressOptions( siteId: number ) {
	return useSiteOptions( siteId, STORE_ADDRESS_OPTION_NAME );
}
