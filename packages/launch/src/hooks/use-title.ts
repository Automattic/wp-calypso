/**
 * External dependencies
 */
import { useContext, useEffect } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { __ } from '@wordpress/i18n';
import { useDispatch, useSelect } from '@wordpress/data';
import { useLocale, englishLocales } from '@automattic/i18n-utils';

/**
 * Internal dependencies
 */
import { SITE_STORE, LAUNCH_STORE } from '../stores';
import LaunchContext from '../context';

export function useTitle() {
	const { siteId } = useContext( LaunchContext );

	const locale = useLocale();

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
	let isDefaultTitle = title === DEFAULT_SITE_NAME;
	let isValidTitle = title !== '' && ! isDefaultTitle;

	// START of non-EN temporary fix for https://github.com/Automattic/wp-calypso/issues/50269
	// @TODO: remove this when we'll have a proper way to know if the title is the default one set by the backend
	if ( englishLocales.indexOf( locale ) === -1 ) {
		// Since we don't know if DEFAULT_SITE_NAME is matching
		// the default title set in the backend at site creation,
		// we consider that any site title that has not been edited during Launch is default
		// and don't use it to suggest domains
		isDefaultTitle = ! launchSiteTitle?.trim();

		// With the fix added above for isDefaultTitle, its value will be true even for valid titles
		// So we should consider valid any non-emtpy title
		isValidTitle = title !== '';
	}
	// END of temporary fix

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
