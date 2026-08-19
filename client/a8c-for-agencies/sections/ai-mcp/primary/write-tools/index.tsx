import { __ } from '@wordpress/i18n';
import { LayoutWithGuidedTour as Layout } from 'calypso/a8c-for-agencies/components/layout/layout-with-guided-tour';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/layout-with-payment-notification';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import { A4A_AI_MCP_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import LayoutBody from 'calypso/layout/hosting-dashboard/body';
import LayoutHeader, {
	LayoutHeaderActions as Actions,
	LayoutHeaderBreadcrumb as Breadcrumb,
	LayoutHeaderSubtitle as Subtitle,
} from 'calypso/layout/hosting-dashboard/header';
import AiMcpWriteToolsContent from './write-tools-content';

export default function AiMcpWriteTools() {
	const title = __( 'Write' );

	return (
		<Layout title={ title } wide>
			<LayoutTop>
				<LayoutHeader>
					<Breadcrumb
						hideOnMobile
						items={ [
							{
								label: __( 'AI and MCP' ),
								href: A4A_AI_MCP_LINK,
							},
							{
								label: title,
							},
						] }
					/>
					<Subtitle>
						{ __( 'Control which actions your external AI assistant can take on your behalf.' ) }
					</Subtitle>
					<Actions useColumnAlignment>
						<MobileSidebarNavigation />
					</Actions>
				</LayoutHeader>
			</LayoutTop>
			<LayoutBody>
				<AiMcpWriteToolsContent />
			</LayoutBody>
		</Layout>
	);
}
