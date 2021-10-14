import { useSelect } from '@wordpress/data';
import { useContext } from 'react';
import LaunchContext from '../context';
import { SITE_STORE } from '../stores';

export function useSiteDomains() {
	const { siteId } = useContext( LaunchContext );
	const sitePrimaryDomain = useSelect( ( select ) =>
		select( SITE_STORE ).getPrimarySiteDomain( siteId )
	);
	const siteSubdomain = useSelect( ( select ) => select( SITE_STORE ).getSiteSubdomain( siteId ) );
	const hasPaidDomain = sitePrimaryDomain && ! sitePrimaryDomain?.is_subdomain;

	return {
		sitePrimaryDomain,
		siteSubdomain,
		hasPaidDomain,
	};
}
