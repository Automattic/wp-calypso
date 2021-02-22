/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
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

	const existingSiteTitle = useSelect( ( select ) => select( SITE_STORE ).getSiteTitle( siteId ), [
		siteId,
	] );
	const launchSiteTitle = useSelect( ( select ) => select( LAUNCH_STORE ).getSiteTitle(), [] );

	const updateTitle = useDispatch( LAUNCH_STORE ).setSiteTitle;
	const saveSiteTitle = useDispatch( SITE_STORE ).saveSiteTitle;

	const [ debouncedSaveSiteTitle ] = useDebouncedCallback( saveSiteTitle, 1000 );

	const noLaunchSiteTitle = typeof launchSiteTitle === 'undefined';
	const title = noLaunchSiteTitle ? existingSiteTitle : launchSiteTitle;

	const DEFAULT_SITE_NAME = __( 'Site Title', __i18n_text_domain__ );
	const isDefaultTitle = title === DEFAULT_SITE_NAME;
	const isValidTitle = title !== '' && ! isDefaultTitle;

	useEffect( () => {
		if ( noLaunchSiteTitle ) {
			return;
		}
		debouncedSaveSiteTitle( siteId, launchSiteTitle );
	}, [ launchSiteTitle, debouncedSaveSiteTitle, siteId, noLaunchSiteTitle ] );

	return {
		isDefaultTitle,
		isValidTitle,
		title,
		updateTitle,
	};
}
