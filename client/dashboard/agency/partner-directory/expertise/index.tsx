import { activeAgencyQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { __ } from '@wordpress/i18n';
import { useAnalytics } from '../../../app/analytics';
import Breadcrumbs from '../../../app/breadcrumbs';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';
import PartnerDirectoryExpertiseContent from './expertise-content';

const DASHBOARD_URL = '/agency/partner-directory';

export default function AgencyPartnerDirectoryExpertise() {
	const { data: agency } = useQuery( activeAgencyQuery() );
	const { recordTracksEvent } = useAnalytics();
	const navigate = useNavigate();

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					prefix={ <Breadcrumbs length={ 2 } /> }
					title={ __( 'Share your expertise' ) }
					description={ __( 'Pick your agency’s specialties and choose your directories.' ) }
				/>
			}
		>
			{ agency && (
				<PartnerDirectoryExpertiseContent
					agency={ agency }
					recordTracksEvent={ recordTracksEvent }
					dashboardUrl={ DASHBOARD_URL }
					onSubmitSuccess={ () => navigate( { to: DASHBOARD_URL } ) }
				/>
			) }
		</PageLayout>
	);
}
