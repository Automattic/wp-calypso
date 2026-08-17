import { __ } from '@wordpress/i18n';
import { LayoutWithGuidedTour as Layout } from 'calypso/a8c-for-agencies/components/layout/layout-with-guided-tour';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/layout-with-payment-notification';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import LayoutBody from 'calypso/layout/hosting-dashboard/body';
import LayoutHeader, {
	LayoutHeaderTitle as Title,
	LayoutHeaderSubtitle as Subtitle,
	LayoutHeaderActions as Actions,
} from 'calypso/layout/hosting-dashboard/header';
import AiMcpOverviewContent from './overview-content';

export default function AiMcpOverview() {
	const title = __( 'AI and MCP' );

	return (
		<Layout title={ title } wide className="a4a-ai-mcp-overview">
			<LayoutTop>
				<LayoutHeader>
					<Title>{ title }</Title>
					<Subtitle>
						{ __(
							'Control how AI assistants interact with your Automattic for Agencies account and sites.'
						) }
					</Subtitle>
					<Actions>
						<MobileSidebarNavigation />
					</Actions>
				</LayoutHeader>
			</LayoutTop>
			<LayoutBody>
				<AiMcpOverviewContent />
			</LayoutBody>
		</Layout>
	);
}
