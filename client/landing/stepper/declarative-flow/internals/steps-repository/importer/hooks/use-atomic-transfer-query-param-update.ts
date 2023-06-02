import { useEffect } from 'react';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { useSiteSlugParam } from 'calypso/landing/stepper/hooks/use-site-slug-param';
import { useSelector } from 'calypso/state';
import { getSite } from 'calypso/state/sites/selectors';
import { updateQueryParams } from '../../import/util';

/**
 * Update site slug when destination site is in transition from simple to atomic
 */
export function useAtomicTransferQueryParamUpdate( siteId: number | undefined ) {
	const currentSearchParams = useQuery();
	const siteItem = useSelector( ( state ) => getSite( state, siteId as number ) );
	const siteSlug = useSiteSlugParam();

	useEffect( checkSiteSlugUpdate, [ siteItem?.slug ] );

	function checkSiteSlugUpdate() {
		if ( siteItem?.slug && siteSlug !== siteItem.slug ) {
			currentSearchParams.set( 'siteSlug', siteItem.slug );
			updateQueryParams( currentSearchParams.toString() );
		}
	}
}
