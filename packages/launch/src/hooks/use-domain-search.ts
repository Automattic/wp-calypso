/**
 * External dependencies
 */
import { useSelect } from '@wordpress/data';
import { useDispatch } from '@wordpress/data';
import { isGoodDefaultDomainQuery } from '@automattic/domain-picker';

/**
 * Internal dependencies
 */
import { LAUNCH_STORE } from '../stores';
import { useSite, useTitle } from './';
import { useSiteDomains } from './use-site-domains';

export function useDomainSearch(): {
	domainSearch: string;
	isLoading: boolean;
	setDomainSearch: ( search: string ) => void;
} {
	const existingDomainSearch = useSelect(
		( select ) => select( LAUNCH_STORE ).getDomainSearch(),
		[]
	);
	const { isDefaultTitle, title } = useTitle();
	const { isLoadingSite: isLoading } = useSite();
	const { siteSubdomain } = useSiteDomains();

	const { setDomainSearch } = useDispatch( LAUNCH_STORE );

	const nonDefaultTitle = ( title && title.length > 1 && ! isDefaultTitle && title ) || '';

	// Domain search query is determined by evaluating the following, in order:
	// 1. existing domain search string saved in Launch store
	// 2. site title, if it's not the default site title
	// 3. site subdomain name
	const domainSearch =
		( existingDomainSearch.trim() ||
			filterUnsuitableTitles( nonDefaultTitle ) ||
			siteSubdomain?.domain?.split( '.' )[ 0 ] ) ??
		'';

	return {
		domainSearch,
		isLoading,
		setDomainSearch,
	};
}

function filterUnsuitableTitles( title: string ): string {
	return isGoodDefaultDomainQuery( title ) ? title : '';
}
