import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import CardHeading from 'calypso/components/card-heading';
import DocumentHead from 'calypso/components/data/document-head';
import Main from 'calypso/components/main';
import BillingDetails from 'calypso/jetpack-cloud/sections/partner-portal/billing-details';
import BillingSummary from 'calypso/jetpack-cloud/sections/partner-portal/billing-summary';
import SelectPartnerKeyDropdown from 'calypso/jetpack-cloud/sections/partner-portal/select-partner-key-dropdown';
import SidebarNavigation from 'calypso/jetpack-cloud/sections/partner-portal/sidebar-navigation';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

import './style.scss';

export default function BillingDashboard() {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const onIssueNewLicenseClick = () => {
		dispatch( recordTracksEvent( 'calypso_partner_portal_issue_license_click_billing_page' ) );
	};

	return (
		<Main fullWidthLayout className="billing-dashboard">
			<DocumentHead title={ translate( 'Billing' ) } />
			<SidebarNavigation />

			<div className="billing-dashboard__header">
				<CardHeading size={ 36 }>{ translate( 'Billing' ) }</CardHeading>

				<SelectPartnerKeyDropdown />

				<Button primary href="/partner-portal/issue-license" onClick={ onIssueNewLicenseClick }>
					{ translate( 'Issue New License' ) }
				</Button>
			</div>

			<BillingSummary />
			<BillingDetails />
		</Main>
	);
}
