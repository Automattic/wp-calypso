import { activeAgencyQuery, agencyLeadMatchingQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useAnalytics } from '../../../app/analytics';
import PartnerDirectoryPage from '../partner-directory-page';
import LeadMatchingSummary from './summary';

export default function AgencyPartnerDirectoryLeadMatching() {
	const { data: agency } = useQuery( activeAgencyQuery() );
	const { data: leadMatching } = useQuery( agencyLeadMatchingQuery( agency?.id ?? 0 ) );
	const { recordTracksEvent } = useAnalytics();

	useEffect( () => {
		recordTracksEvent( 'calypso_a4a_partner_directory_lead_matching_view' );
	}, [ recordTracksEvent ] );

	return (
		<PartnerDirectoryPage tab="lead-matching">
			{ agency && leadMatching && (
				<LeadMatchingSummary agency={ agency } profile={ leadMatching.lead_matching_profile } />
			) }
		</PartnerDirectoryPage>
	);
}
