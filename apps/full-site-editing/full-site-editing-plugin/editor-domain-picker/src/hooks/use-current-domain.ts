/**
 * External dependencies
 */
import { useSelect } from '@wordpress/data';
import { Site } from '@automattic/data-stores';

const SITES_STORE = Site.register( { client_id: '', client_secret: '' } );

declare global {
	interface Window {
		_currentSiteId: number;
	}
}

export function useSite() {
	return useSelect( ( select ) => select( SITES_STORE ).getSite( window._currentSiteId ) );
}

export function useCurrentDomain() {
	const site = useSite();
	return ( site?.URL && new URL( site?.URL ).hostname ) || '';
}
