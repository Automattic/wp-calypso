/**
 * External dependencies
 */
import { useDispatch, useSelect } from '@wordpress/data';
import { useContext, useEffect } from 'react';
import { useDebouncedCallback } from 'use-debounce';

/**
 * Internal dependencies
 */
import { SITE_STORE, LAUNCH_STORE } from '../stores';
import LaunchContext from '../context';

export function useTitle() {
	const { siteId } = useContext( LaunchContext );
	const title = useSelect( ( select ) => select( SITE_STORE ).getSiteTitle( siteId ) );
	const launchSiteTitle = useSelect( ( select ) => select( LAUNCH_STORE ) ).getSiteTitle();
	const setLaunchSiteTitle = useDispatch( LAUNCH_STORE ).setSiteTitle;
	const saveSiteTitle = useDispatch( SITE_STORE ).saveSiteTitle;
	const [ debouncedSaveSiteTitle ] = useDebouncedCallback( saveSiteTitle, 1000 );

	const noLaunchSiteTitle = typeof launchSiteTitle === 'undefined';

	useEffect( () => {
		if ( noLaunchSiteTitle ) {
			return;
		}
		debouncedSaveSiteTitle( siteId, launchSiteTitle );
	}, [ launchSiteTitle, debouncedSaveSiteTitle, siteId, noLaunchSiteTitle ] );

	return {
		title: noLaunchSiteTitle ? title : launchSiteTitle,
		updateTitle: setLaunchSiteTitle,
	};
}
