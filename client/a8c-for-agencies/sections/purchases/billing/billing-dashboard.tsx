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
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';

export default function BillingDashboard() {
	const translate = useTranslate();

	const title = translate( 'Billing' );

	const partnerCanIssueLicense = true; // FIXME: get this from state

	const onIssueNewLicenseClick = () => {
		// TODO: dispatch action to open issue license modal
	};

	return (
		<Layout
			className="billing-dashboard"
			title={ title }
			wide
			sidebarNavigation={ <MobileSidebarNavigation /> }
		>
			<PageViewTracker title="Partner Portal > Billing" path="/partner-portal/billing" />

			<LayoutTop>
				<LayoutHeader>
					<Title>{ title } </Title>
					<Actions>
						<Button
							disabled={ ! partnerCanIssueLicense }
							href={ partnerCanIssueLicense ? '/marketplace' : undefined }
							onClick={ onIssueNewLicenseClick }
							primary
						>
							{ translate( 'Issue New License' ) }
						</Button>
					</Actions>
				</LayoutHeader>
			</LayoutTop>

			<LayoutBody>test</LayoutBody>
		</Layout>
	);
}
