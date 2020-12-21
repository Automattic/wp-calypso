/**
 * External dependencies
 */
import { useSelect } from '@wordpress/data';
import { useDispatch } from '@wordpress/data';
/**
 * External dependencies
 */
import { LAUNCH_STORE } from '../stores';
import { useSite, useTitle } from './';
import { isDefaultSiteTitle } from '../utils';
import { useSiteDomains } from './use-site-domains';

export function useDomainSearch(): {
	domainSearch: string;
	isLoading: boolean;
	setDomainSearch: ( search: string ) => void;
} {
	const { domainSearch } = useSelect( ( select ) => select( LAUNCH_STORE ).getState() );
	const { title } = useTitle();
	const { isLoadingSite } = useSite();
	const { siteSubdomain } = useSiteDomains();

	const { setDomainSearch } = useDispatch( LAUNCH_STORE );

	let search = domainSearch.trim() || filterUnsuitableTitles( title || '' );

	if ( ! search || isDefaultSiteTitle( { currentSiteTitle: search } ) ) {
		search = siteSubdomain?.domain?.split( '.' )[ 0 ] ?? '';
	}

	return {
		domainSearch: search,
		isLoading: isLoadingSite,
		setDomainSearch,
	};
}

function filterUnsuitableTitles( title: string ): string {
	return isGoodDefaultDomainQuery( title ) ? title : '';
}

export function isGoodDefaultDomainQuery( domainQuery: string ): boolean {
	if ( typeof domainQuery.normalize === 'undefined' ) {
		// If the browser doesn't support String.prototype.normalize then
		// play it safe and assume this isn't a safe domain query.
		return false;
	}

	return !! domainQuery
		.normalize( 'NFD' ) // Encode diacritics in a consistent way so we can remove them
		.replace( /[\u0300-\u036f]/g, '' )
		.match( /[a-z0-9-.\s]/i );
}
