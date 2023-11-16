import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import CardHeading from 'calypso/components/card-heading';
import BillingDetails from 'calypso/jetpack-cloud/sections/partner-portal/billing-details';
import BillingSummary from 'calypso/jetpack-cloud/sections/partner-portal/billing-summary';
import SelectPartnerKeyDropdown from 'calypso/jetpack-cloud/sections/partner-portal/select-partner-key-dropdown';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import Layout from '../../layout';
import LayoutBody from '../../layout/body';
import LayoutHeader from '../../layout/header';
import LayoutTop from '../../layout/top';

export default function BillingDashboard() {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const onIssueNewLicenseClick = () => {
		dispatch( recordTracksEvent( 'calypso_partner_portal_issue_license_click_billing_page' ) );
	};

	return (
		<Layout className="billing-dashboard" title={ translate( 'Billing' ) } wide>
			<LayoutTop>
				<LayoutHeader>
					<CardHeading size={ 36 }>{ translate( 'Billing' ) }</CardHeading>

					<SelectPartnerKeyDropdown />

					<Button primary href="/partner-portal/issue-license" onClick={ onIssueNewLicenseClick }>
						{ translate( 'Issue New License' ) }
					</Button>
				</LayoutHeader>
			</LayoutTop>

			<LayoutBody>
				<BillingSummary />
				<BillingDetails />
			</LayoutBody>
		</Layout>
	);
}
