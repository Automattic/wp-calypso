/**
 * External dependencies
 */
import { useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { SITE_STORE } from '../stores';

declare global {
	interface Window {
		_currentSiteId: number;
	}
}

export function useSite() {
	return useSelect( ( select ) => select( SITE_STORE ).getSite( window._currentSiteId ) );
}

export function useCurrentDomainName() {
	const site = useSite();
	return ( site?.URL && new URL( site?.URL ).hostname ) || '';
}
