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

export function useDomainSearch(): string {
	const { domainSearch } = useSelect( ( select ) => select( LAUNCH_STORE ).getState() );
	const { title } = useTitle();
	const { currentDomainName } = useSite();

	let search = domainSearch.trim() || title;

	if ( ! search || isDefaultSiteTitle( { currentSiteTitle: search, exact: true } ) ) {
		search = currentDomainName?.split( '.' )[ 0 ] ?? '';
	}

	return search;
}
