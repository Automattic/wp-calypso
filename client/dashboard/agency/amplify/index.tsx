import { useNavigate } from '@tanstack/react-router';
import { agencyAmplifyRoute } from '../../app/router/agency';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { AgencyNotices } from '../components/agency-notices';
import { getFeatureDescription, getFeatureName, NEW_REPORT_ACTION } from './constants';
import AmplifyContent from './content';
import AmplifyHeaderActions from './header-actions';
import { AmplifyApprovalNotice } from './usage-meter';
import { useAmplifyPage } from './use-amplify-page';
import type { AmplifyNewReportRequest, AmplifyTiersLink } from './types';

export default function AgencyAmplify() {
	const page = useAmplifyPage();
	const navigate = useNavigate();
	const tiersLink: AmplifyTiersLink = {
		onNavigate: ( path ) => navigate( { to: path as '/tiers' } ),
	};
	const { action } = agencyAmplifyRoute.useSearch();
	const newReportRequest: AmplifyNewReportRequest = {
		isRequested: action === NEW_REPORT_ACTION,
		onClear: () =>
			navigate( { to: '/prospect-reports', search: { action: undefined }, replace: true } ),
	};

	return (
		<PageLayout
			notices={
				<AgencyNotices
					candidates={ [
						{
							id: 'amplify-approval',
							isEligible: page.usageStatus === 'pending' || page.usageStatus === 'rejected',
							notice: (
								<AmplifyApprovalNotice agencyId={ page.agencyId } status={ page.usageStatus } />
							),
						},
					] }
				/>
			}
			header={
				<PageHeader
					title={ getFeatureName() }
					description={ getFeatureDescription() }
					actions={
						<AmplifyHeaderActions
							page={ page }
							tiersLink={ tiersLink }
							newReportRequest={ newReportRequest }
						/>
					}
				/>
			}
		>
			<AmplifyContent page={ page } tiersLink={ tiersLink } />
		</PageLayout>
	);
}
