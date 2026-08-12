import { activeAgencyQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import { useAnalytics } from '../../app/analytics';
import { useHelpCenter } from '../../app/help-center';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import PartnerDirectoryDashboardContent from './dashboard-content';

/*
 * TODO: The expertise and profile forms are not migrated to the dashboard yet,
 * so these point at the A4A app routes, which don't resolve here. Update them
 * once those screens are migrated.
 */
const EXPERTISE_URL = '/partner-directory/agency-expertise';
const PROFILE_URL = '/partner-directory/agency-details';

export default function AgencyPartnerDirectory() {
	const { data: agency } = useQuery( activeAgencyQuery() );
	const { recordTracksEvent } = useAnalytics();
	const { setShowHelpCenter, setNavigateToRoute } = useHelpCenter();

	const openSupportGuide = ( link: string ) => {
		setShowHelpCenter( true );
		setNavigateToRoute( '/post?link=' + encodeURIComponent( link ) );
	};

	return (
		<PageLayout size="small" header={ <PageHeader title={ __( 'Partner Directory' ) } /> }>
			{ agency && (
				<PartnerDirectoryDashboardContent
					agency={ agency }
					recordTracksEvent={ recordTracksEvent }
					expertiseUrl={ EXPERTISE_URL }
					profileUrl={ PROFILE_URL }
					openSupportGuide={ openSupportGuide }
				/>
			) }
		</PageLayout>
	);
}
