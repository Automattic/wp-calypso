import { useAnalytics } from '../../app/analytics';
import type { Domain } from '@automattic/api-core';

export function useTrackOverviewItem( domain: Domain ) {
	const { recordTracksEvent } = useAnalytics();

	return ( item: string ) =>
		recordTracksEvent( 'calypso_dashboard_domain_overview_item_click', {
			item,
			subtype: domain.subtype.id,
			domain: domain.domain,
		} );
}
