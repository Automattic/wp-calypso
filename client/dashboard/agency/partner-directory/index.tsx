import { activeAgencyQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import { useAnalytics } from '../../app/analytics';
import { useHelpCenter } from '../../app/help-center';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { a4aLink } from '../../utils/link';
import PartnerDirectoryDashboardContent from './dashboard-content';

const EXPERTISE_URL = '/agency/partner-directory/expertise';

/*
 * TODO: The profile and lead matching screens are not migrated to the
 * dashboard yet, so this links to the classic A4A app — and lead matching is
 * not reachable from here at all until it migrates. Switch to dashboard
 * routes once those screens are migrated.
 */
const PROFILE_URL = a4aLink( '/partner-directory/agency-details' );

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
					expertiseUrl={ EXPERTISE_URL }
					profileUrl={ PROFILE_URL }
					openSupportGuide={ openSupportGuide }
				/>
			) }
		</PageLayout>
	);
}
