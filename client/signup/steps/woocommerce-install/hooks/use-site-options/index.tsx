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

	// Force a site settings request.
	useEffect( () => {
		if ( ! siteId ) {
			return;
		}

		dispatch( requestSiteSettings( siteId ) );
	}, [ dispatch, siteId ] );

	// Site settings data (from remote).
	const siteSettingsData = useMemo( () => {
		return settings?.[ optionId ] || {};
	}, [ optionId, settings ] );

	const save = useCallback(
		() => dispatch( saveSiteSettings( siteId, { [ optionId ]: siteSettingsData } ) ),
		[ dispatch, optionId, siteId, siteSettingsData ]
	);

	const update = useCallback(
		( data: object ) => {
			dispatch( updateSiteSettings( siteId, { [ optionId ]: { ...siteSettingsData, ...data } } ) );
		},
		[ optionId, siteId, dispatch, siteSettingsData ]
	);

	const clean = () => dispatch( updateSiteSettings( siteId, { [ optionId ]: {} } ) );

	function get( key: string ) {
		return siteSettingsData?.[ key ] || '';
	}

	return { data: { ...siteSettingsData }, save, clean, update, get };
}

export function useStoreAddressOptions( siteId: number ) {
	const { data, save, clean, update, get } = useSiteOptions( siteId, STORE_ADDRESS_OPTION_NAME );

	const storeData = {
		address_1: '',
		address_2: '',
		countryRegion: '',
		city: '',
		postcode: '',
		...data,
	};

	return { data: storeData, save, clean, update, get };
}
