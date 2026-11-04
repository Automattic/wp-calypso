import { useNavigate } from '@tanstack/react-router';
import { __ } from '@wordpress/i18n';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { AgencyNotices } from '../components/agency-notices';
import { getFeatureName } from './constants';
import AmplifyContent from './content';
import AmplifyHeaderActions from './header-actions';
import { AmplifyApprovalNotice } from './usage-meter';
import { useAmplifyPage } from './use-amplify-page';
import type { AmplifyTiersLink } from './types';

export default function AgencyAmplify() {
	const page = useAmplifyPage();
	const navigate = useNavigate();
	const tiersLink: AmplifyTiersLink = {
		onNavigate: ( path ) => navigate( { to: path as '/tiers' } ),
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
					description={ __(
						'Win more business by auditing a prospect’s homepage, spotting the problems, and pitching the fixes.'
					) }
					actions={ <AmplifyHeaderActions page={ page } tiersLink={ tiersLink } /> }
				/>
			}
		>
			<AmplifyContent page={ page } tiersLink={ tiersLink } />
		</PageLayout>
	);
}
