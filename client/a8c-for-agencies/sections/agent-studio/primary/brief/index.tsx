import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { brush } from '@wordpress/icons';
import A4AEmptyState from 'calypso/a8c-for-agencies/components/a4a-empty-state';
import { LayoutWithGuidedTour as Layout } from 'calypso/a8c-for-agencies/components/layout/layout-with-guided-tour';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/layout-with-payment-notification';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import LayoutBody from 'calypso/layout/hosting-dashboard/body';
import LayoutHeader, {
	LayoutHeaderActions as Actions,
	LayoutHeaderBreadcrumb as Breadcrumb,
} from 'calypso/layout/hosting-dashboard/header';
import { useAgentStudioAgent } from '../../lib/agents';
import { getAgentStudioPath } from '../../lib/paths';
import BriefContent from './brief-content';

interface Props {
	agentId?: string;
}

export default function AgentStudioBrief( { agentId }: Props ) {
	const agent = useAgentStudioAgent( agentId );
	const title = agent ? agent.deliverableType : __( 'Brief an agent' );

	return (
		<Layout title={ title } wide className="a4a-agent-studio-brief">
			<LayoutTop>
				<LayoutHeader>
					<Breadcrumb
						hideOnMobile
						items={ [
							{
								label: __( 'Agent studio' ),
								href: getAgentStudioPath(),
							},
							{
								label: __( 'New deliverable' ),
							},
						] }
					/>
					<Actions>
						<MobileSidebarNavigation />
					</Actions>
				</LayoutHeader>
			</LayoutTop>
			<LayoutBody>
				{ agent ? (
					<BriefContent agent={ agent } />
				) : (
					<A4AEmptyState
						icon={ brush }
						title={ __( 'Agent not found' ) }
						description={ __(
							'This agent isn’t available. Pick one from Agent studio to get started.'
						) }
					>
						<Button variant="primary" href={ getAgentStudioPath() }>
							{ __( 'Back to Agent studio' ) }
						</Button>
					</A4AEmptyState>
				) }
			</LayoutBody>
		</Layout>
	);
}
