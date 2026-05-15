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
import { getAgentStudioProjectPath } from '../../lib/paths';
import CreateProjectModal from './create-project-modal';
import AgentStudioOverviewContent from './overview-content';

export default function AgentStudioOverview() {
	const dispatch = useDispatch();
	const title = __( 'Agent studio' );
	const [ isCreateModalOpen, setIsCreateModalOpen ] = useState( false );

	const openCreateModal = useCallback( () => {
		dispatch( recordTracksEvent( 'calypso_a4a_agent_studio_new_project_click' ) );
		setIsCreateModalOpen( true );
	}, [ dispatch ] );

	const closeCreateModal = useCallback( () => {
		setIsCreateModalOpen( false );
	}, [] );

	return (
		<Layout title={ title } wide className="a4a-agent-studio-overview">
			<LayoutTop>
				<LayoutHeader>
					<Title>{ title }</Title>
					<Actions>
						<MobileSidebarNavigation />
						<Button variant="primary" icon={ plus } onClick={ openCreateModal }>
							{ __( 'New project' ) }
						</Button>
					</Actions>
				</LayoutHeader>
			</LayoutTop>
			<LayoutBody>
				<AgentStudioOverviewContent onCreateProject={ openCreateModal } />
			</LayoutBody>
			{ isCreateModalOpen && (
				<CreateProjectModal
					onClose={ closeCreateModal }
					onCreated={ ( projectId ) => {
						setIsCreateModalOpen( false );
						pageRouter( getAgentStudioProjectPath( projectId ) );
					} }
				/>
			) }
		</Layout>
	);
}
