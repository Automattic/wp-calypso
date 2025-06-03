import { useTranslate } from 'i18n-calypso';
import { LayoutWithGuidedTour as Layout } from 'calypso/a8c-for-agencies/components/layout/layout-with-guided-tour';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/layout-with-payment-notification';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import LayoutBody from 'calypso/layout/hosting-dashboard/body';
import LayoutHeader, {
	LayoutHeaderActions as Actions,
	LayoutHeaderTitle as Title,
} from 'calypso/layout/hosting-dashboard/header';

export default function ReportsDashboard() {
	const translate = useTranslate();
	const title = translate( 'Reports Dashboard' );

	return (
		<Layout title={ title } wide>
			<LayoutTop>
				<LayoutHeader className="a4a-reports-header">
					<Title>{ title }</Title>
					<Actions className="a4a-reports__header-actions">
						<MobileSidebarNavigation />
					</Actions>
				</LayoutHeader>
			</LayoutTop>
			<LayoutBody className="a4a-reports-content">
				<div className="a4a-reports__main-content">
					<h1>{ title }</h1>
				</div>
			</LayoutBody>
		</Layout>
	);
}
