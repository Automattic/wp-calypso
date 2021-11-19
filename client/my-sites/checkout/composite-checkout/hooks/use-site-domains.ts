import debugFactory from 'debug';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSiteDomains } from 'calypso/state/sites/domains/actions';
import { getDomainsBySiteId, hasLoadedSiteDomains } from 'calypso/state/sites/domains/selectors';
import type { SiteDomain } from 'calypso/state/sites/domains/types';

const debug = debugFactory( 'calypso:composite-checkout:use-site-domains' );

export default function useSiteDomains( siteId: number | undefined ): SiteDomain[] {
	const dispatch = useDispatch();

	const [ siteDomains, setSiteDomains ] = useState< SiteDomain[] >( [] );

	const areDomainsLoaded = useSelector(
		( state ) => siteId && hasLoadedSiteDomains( state, siteId )
	);

	const domains: SiteDomain[] = useSelector( ( state ) => {
		if ( areDomainsLoaded && siteId ) {
			return getDomainsBySiteId( state, siteId );
		}
		return [];
	} );

	useEffect( () => {
		if ( areDomainsLoaded ) {
			debug( 'Setting list of domains', domains );

			setSiteDomains( domains );
		} else if ( siteId ) {
			debug( 'Fetching list of domains' );

			dispatch( fetchSiteDomains( siteId ) );
		}
	}, [ areDomainsLoaded, dispatch, domains, siteId ] );

	return siteDomains;
}
