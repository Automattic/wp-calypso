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

export function useDomainSearch(): {
	domainSearch: string;
	isLoading: boolean;
	setDomainSearch: ( search: string ) => void;
} {
	const { domainSearch } = useSelect( ( select ) => select( LAUNCH_STORE ).getState() );
	const { title } = useTitle();
	const { currentDomainName, isLoadingSite } = useSite();
	const { setDomainSearch } = useDispatch( LAUNCH_STORE );

	let search = domainSearch.trim() || title;

	if ( ! search || isDefaultSiteTitle( { currentSiteTitle: search, exact: true } ) ) {
		search = currentDomainName?.split( '.' )[ 0 ] ?? '';
	}

	return {
		domainSearch: search,
		isLoading: isLoadingSite,
		setDomainSearch,
	};
}
