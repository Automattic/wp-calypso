import { useSelect } from '@wordpress/data';
import { useContext } from 'react';
import LaunchContext from '../context';
import { SITE_STORE } from '../stores';
import type { SiteSelect } from '@automattic/data-stores';

export function useSiteDomains() {
	const { siteId } = useContext( LaunchContext );
	const sitePrimaryDomain = useSelect(
		( select ) => ( select( SITE_STORE ) as SiteSelect ).getPrimarySiteDomain( siteId ),
		[]
	);
	const siteSubdomain = useSelect(
		( select ) => ( select( SITE_STORE ) as SiteSelect ).getSiteSubdomain( siteId ),
		[]
	);
	const hasPaidDomain = sitePrimaryDomain && ! sitePrimaryDomain?.is_subdomain;

	return {
		sitePrimaryDomain,
		siteSubdomain,
		hasPaidDomain,
	};
}
