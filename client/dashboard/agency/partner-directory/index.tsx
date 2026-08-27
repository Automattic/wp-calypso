import { activeAgencyQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import { useAnalytics } from '../../app/analytics';
import { useHelpCenter } from '../../app/help-center';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import PartnerDirectoryDashboardContent from './dashboard-content';
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
		<PageLayout size="small" header={ <PageHeader title={ __( 'Partner Directories' ) } /> }>
			{ agency && (
				<PartnerDirectoryDashboardContent
					agency={ agency }
					recordTracksEvent={ recordTracksEvent }
					expertiseUrl={ PARTNER_DIRECTORY_EXPERTISE_ROUTE }
					profileUrl={ PARTNER_DIRECTORY_DETAILS_ROUTE }
					openSupportGuide={ openSupportGuide }
				/>
			) }
		</PageLayout>
	);
}
