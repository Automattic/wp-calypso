import { __ } from '@wordpress/i18n';
import { LayoutWithGuidedTour as Layout } from 'calypso/a8c-for-agencies/components/layout/layout-with-guided-tour';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/layout-with-payment-notification';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import { A4A_AMPLIFY_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import LayoutBody from 'calypso/layout/hosting-dashboard/body';
import LayoutHeader, {
	LayoutHeaderBreadcrumb as Breadcrumb,
	LayoutHeaderActions as Actions,
} from 'calypso/layout/hosting-dashboard/header';
import AmplifyReportsContent from './amplify-reports-content';

const AmplifyReports = () => {
	const title = __( 'Reports' );

	return (
		<Layout className="amplify-reports-page full-width-layout-with-table" title={ title } wide>
			<LayoutTop>
				<LayoutHeader>
					<Breadcrumb
						items={ [
							{ label: __( 'Amplify' ), href: A4A_AMPLIFY_LINK },
							{ label: __( 'Reports' ) },
						] }
					/>
					<Actions>
						<MobileSidebarNavigation />
					</Actions>
				</LayoutHeader>
			</LayoutTop>
			<LayoutBody>
				<AmplifyReportsContent />
			</LayoutBody>
		</Layout>
	);
};

export default AmplifyReports;
