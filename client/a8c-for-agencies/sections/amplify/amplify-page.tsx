import { __ } from '@wordpress/i18n';
import { LayoutWithGuidedTour as Layout } from 'calypso/a8c-for-agencies/components/layout/layout-with-guided-tour';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/layout-with-payment-notification';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import LayoutBody from 'calypso/layout/hosting-dashboard/body';
import LayoutHeader, {
	LayoutHeaderTitle as Title,
	LayoutHeaderActions as Actions,
} from 'calypso/layout/hosting-dashboard/header';
import AmplifyOverviewContent from './amplify-overview-content';
import AmplifyReportsContent from './amplify-reports-content';
import type { ReactNode } from 'react';

export type AmplifyTab = 'overview' | 'reports';

type Props = {
	selectedTab: AmplifyTab;
};

export default function AmplifyPage( { selectedTab }: Props ) {
	let title: string;
	let content: ReactNode;
	switch ( selectedTab ) {
		case 'overview':
			title = __( 'Overview' );
			content = <AmplifyOverviewContent />;
			break;
		case 'reports':
			title = __( 'Reports' );
			content = <AmplifyReportsContent />;
			break;
	}

	return (
		<Layout title={ title } wide>
			<LayoutTop>
				<LayoutHeader>
					<Title>{ title }</Title>
					<Actions>
						<MobileSidebarNavigation />
					</Actions>
				</LayoutHeader>
			</LayoutTop>

			<LayoutBody>{ content }</LayoutBody>
		</Layout>
	);
}
