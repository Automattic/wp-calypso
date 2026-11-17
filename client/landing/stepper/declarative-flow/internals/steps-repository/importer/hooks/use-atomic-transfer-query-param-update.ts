import { useEffect } from 'react';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { useSiteSlugParam } from 'calypso/landing/stepper/hooks/use-site-slug-param';
import { updateQueryParams } from '../../import/util';
import type { SiteDetails } from '@automattic/data-stores';

/**
 * Update site slug when destination site is in transition from simple to atomic
 */
export function useAtomicTransferQueryParamUpdate( siteItem: SiteDetails | null | undefined ) {
	const currentSearchParams = useQuery();
	const siteSlug = useSiteSlugParam();

	useEffect( checkSiteSlugUpdate, [ siteItem?.slug ] );

	function checkSiteSlugUpdate() {
		if ( siteItem?.slug && siteSlug !== siteItem.slug ) {
			currentSearchParams.set( 'siteSlug', siteItem.slug );
			updateQueryParams( currentSearchParams.toString() );
		}
	}
}
