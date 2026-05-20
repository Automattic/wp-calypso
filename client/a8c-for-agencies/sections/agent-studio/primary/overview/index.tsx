import pageRouter from '@automattic/calypso-router';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { plus } from '@wordpress/icons';
import { useCallback, useState } from 'react';
import { LayoutWithGuidedTour as Layout } from 'calypso/a8c-for-agencies/components/layout/layout-with-guided-tour';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/layout-with-payment-notification';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import LayoutBody from 'calypso/layout/hosting-dashboard/body';
import LayoutHeader, {
	LayoutHeaderActions as Actions,
	LayoutHeaderTitle as Title,
} from 'calypso/layout/hosting-dashboard/header';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import AgentPickerModal from '../../components/agent-picker-modal';
import { getAgentStudioBriefPath } from '../../lib/paths';
import AgentStudioOverviewContent from './overview-content';
import type { AgentStudioAgentId } from '../../lib/agents';

export default function AgentStudioOverview() {
	const dispatch = useDispatch();
	const title = __( 'Agent studio' );
	const [ isAgentPickerOpen, setIsAgentPickerOpen ] = useState( false );

	const openAgentPicker = useCallback( () => {
		dispatch( recordTracksEvent( 'calypso_a4a_agent_studio_new_deliverable_click' ) );
		setIsAgentPickerOpen( true );
	}, [ dispatch ] );

	const closeAgentPicker = useCallback( () => {
		setIsAgentPickerOpen( false );
	}, [] );

	const onPickAgent = useCallback(
		( agentId: AgentStudioAgentId ) => {
			dispatch(
				recordTracksEvent( 'calypso_a4a_agent_studio_agent_picked', { agent_id: agentId } )
			);
			setIsAgentPickerOpen( false );
			pageRouter( getAgentStudioBriefPath( agentId ) );
		},
		[ dispatch ]
	);

	return (
		<Layout title={ title } wide className="a4a-agent-studio-overview">
			<LayoutTop>
				<LayoutHeader>
					<Title>{ title }</Title>
					<Actions>
						<MobileSidebarNavigation />
						<Button variant="primary" icon={ plus } onClick={ openAgentPicker }>
							{ __( 'New deliverable' ) }
						</Button>
					</Actions>
				</LayoutHeader>
			</LayoutTop>
			<LayoutBody>
				<AgentStudioOverviewContent onCreateDeliverable={ openAgentPicker } />
			</LayoutBody>
			{ isAgentPickerOpen && (
				<AgentPickerModal onClose={ closeAgentPicker } onPick={ onPickAgent } />
			) }
		</Layout>
	);
}
