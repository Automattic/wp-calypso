/* eslint-disable no-restricted-imports */
import {
	agencySiteQuery,
	queryClient,
	siteBySlugQuery,
	sitePerformancePagesQuery,
} from '@automattic/api-queries';
/* eslint-enable no-restricted-imports */
import type { GateableSiteFeature } from '../app/context';

// Site access on A4A is agency membership: the site must be in the agency's
// managed list. The dotcom capability check doesn't apply to agency operators.
export const agencySiteAccessQuery = ( siteSlug: string ) => ( {
	queryKey: [ ...agencySiteQuery( siteSlug ).queryKey, 'access' ],
	queryFn: async () => Boolean( await queryClient.ensureQueryData( agencySiteQuery( siteSlug ) ) ),
} );

// Feature access on A4A comes from the agency's licenses, not the site plan.
export const agencySiteFeatureAccessQuery = (
	siteSlug: string,
	feature: GateableSiteFeature
) => ( {
	queryKey: [ ...agencySiteQuery( siteSlug ).queryKey, 'feature-access', feature ],
	queryFn: async () => {
		const site = await queryClient.ensureQueryData( agencySiteQuery( siteSlug ) );
		switch ( feature ) {
			case 'backups':
				return Boolean( site?.has_backup );
			case 'scan':
				return Boolean( site?.has_scan );
		}
	},
} );

export async function agencySiteOverviewLoader( siteSlug: string ) {
	const [ , site ] = await Promise.all( [
		queryClient.ensureQueryData( agencySiteQuery( siteSlug ) ),
		queryClient.ensureQueryData( siteBySlugQuery( siteSlug ) ),
	] );
	queryClient.prefetchQuery( sitePerformancePagesQuery( site.ID ) );
}
