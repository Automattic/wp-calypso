import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import Layout from 'calypso/a8c-for-agencies/components/layout';
import LayoutBody from 'calypso/a8c-for-agencies/components/layout/body';
import LayoutHeader, {
	LayoutHeaderActions as Actions,
	LayoutHeaderTitle as Title,
} from 'calypso/a8c-for-agencies/components/layout/header';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/top';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import { A4A_MARKETPLACE_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import BillingDetails from './billing-details';
import BillingSummary from './billing-summary';

import './style.scss';

export default function BillingDashboard() {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const title = translate( 'Billing' );

	const partnerCanIssueLicense = true; // FIXME: get this from state

	const onIssueNewLicenseClick = () => {
		dispatch( recordTracksEvent( 'calypso_a4a_billing_page_issue_license_click' ) );
	};

	return (
		<Layout className="billing-dashboard" title={ title } wide>
			<LayoutTop>
				<LayoutHeader>
					<Title>{ title } </Title>
					<Actions className="a4a-billing__header-actions">
						<MobileSidebarNavigation />
						<Button
							disabled={ ! partnerCanIssueLicense }
							href={ partnerCanIssueLicense ? A4A_MARKETPLACE_LINK : undefined }
							onClick={ onIssueNewLicenseClick }
							primary
						>
							{ translate( 'Issue New License' ) }
						</Button>
					</Actions>
				</LayoutHeader>
			</LayoutTop>

			<LayoutBody>
				<BillingSummary />
				<BillingDetails />
			</LayoutBody>
		</Layout>
	);
}
