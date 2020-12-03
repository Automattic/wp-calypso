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

	let search = domainSearch.trim() || title;

	if ( ! search || isDefaultSiteTitle( { currentSiteTitle: search } ) ) {
		search = siteSubdomain?.domain?.split( '.' )[ 0 ] ?? '';
	}

	return {
		domainSearch: search,
		isLoading: isLoadingSite,
		setDomainSearch,
	};
}
