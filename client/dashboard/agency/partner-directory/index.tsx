import { activeAgencyQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useAnalytics } from '../../app/analytics';
import { useHelpCenter } from '../../app/help-center';
import PartnerDirectoryDashboardContent from './dashboard-content';
import PartnerDirectoryPage from './partner-directory-page';
import { PARTNER_DIRECTORY_DETAILS_ROUTE, PARTNER_DIRECTORY_EXPERTISE_ROUTE } from './paths';

export default function AgencyPartnerDirectory() {
	const { data: agency } = useQuery( activeAgencyQuery() );
	const { recordTracksEvent } = useAnalytics();
	const { setShowHelpCenter, setNavigateToRoute } = useHelpCenter();

	const openSupportGuide = ( link: string ) => {
		setShowHelpCenter( true );
		setNavigateToRoute( '/post?link=' + encodeURIComponent( link ) );
	};

	return (
		<PartnerDirectoryPage tab="overview">
			{ agency && (
				<PartnerDirectoryDashboardContent
					agency={ agency }
					recordTracksEvent={ recordTracksEvent }
					expertiseUrl={ PARTNER_DIRECTORY_EXPERTISE_ROUTE }
					profileUrl={ PARTNER_DIRECTORY_DETAILS_ROUTE }
					openSupportGuide={ openSupportGuide }
					showIntro={ false }
				/>
			) }
		</PartnerDirectoryPage>
	);
}
