/**
 * External dependencies
 */
import { useSelect } from '@wordpress/data';

/**
 * External dependencies
 */
import { LAUNCH_STORE } from '../stores';
import { useSite, useTitle } from './';
import { isDefaultSiteTitle } from '../utils';

export function useDomainSearch(): { domainSearch: string; isLoading: boolean } {
	const { domainSearch } = useSelect( ( select ) => select( LAUNCH_STORE ).getState() );
	const { title, isLoading: isTitleLoading } = useTitle();
	const { currentDomainName, isLoading: isSiteLoading } = useSite();

	let search = domainSearch.trim() || title;

	if ( ! search || isDefaultSiteTitle( { currentSiteTitle: search, exact: true } ) ) {
		search = currentDomainName?.split( '.' )[ 0 ] ?? '';
	}

	return {
		domainSearch: search,
		isLoading: isTitleLoading || isSiteLoading,
	};
}
