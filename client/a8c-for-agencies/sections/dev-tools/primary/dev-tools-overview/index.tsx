import { __ } from '@wordpress/i18n';
import { LayoutWithGuidedTour as Layout } from 'calypso/a8c-for-agencies/components/layout/layout-with-guided-tour';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/layout-with-payment-notification';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import LayoutBody from 'calypso/layout/hosting-dashboard/body';
import LayoutHeader, {
	LayoutHeaderTitle as Title,
	LayoutHeaderActions as Actions,
} from 'calypso/layout/hosting-dashboard/header';
import DevToolsContent from './dev-tools-content';

import './style.scss';

export default function DevToolsOverview() {
	const title = __( 'Developer tools' );

	return (
		<Layout className="dev-tools-overview" title={ title } wide>
			<LayoutTop>
				<LayoutHeader>
					<Title>{ title }</Title>
					<Actions>
						<MobileSidebarNavigation />
					</Actions>
				</LayoutHeader>
			</LayoutTop>

			<LayoutBody>
				<DevToolsContent />
			</LayoutBody>
		</Layout>
	);
}
