/**
 * External dependencies
 */
import * as React from 'react';
import { useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { SITE_STORE } from '../stores';
import LaunchContext from '../context';

export function useSiteDomains() {
	const { siteId } = React.useContext( LaunchContext );
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
