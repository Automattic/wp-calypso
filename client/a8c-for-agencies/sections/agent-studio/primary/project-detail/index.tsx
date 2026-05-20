import pageRouter from '@automattic/calypso-router';
import { Button, DropdownMenu } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { moreVertical, plus, trash } from '@wordpress/icons';
import { useCallback, useState } from 'react';
import { LayoutWithGuidedTour as Layout } from 'calypso/a8c-for-agencies/components/layout/layout-with-guided-tour';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/layout-with-payment-notification';
import { PageBodyPlaceholder } from 'calypso/a8c-for-agencies/components/page-placeholder';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import LayoutBody from 'calypso/layout/hosting-dashboard/body';
import LayoutHeader, {
	LayoutHeaderActions as Actions,
	LayoutHeaderBreadcrumb as Breadcrumb,
} from 'calypso/layout/hosting-dashboard/header';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import AgentPickerModal from '../../components/agent-picker-modal';
import useAgentStudioProject from '../../data/use-agent-studio-project';
import { getAgentStudioBriefPath, getAgentStudioPath } from '../../lib/paths';
import DeleteProjectDialog from './delete-project-dialog';
import ProjectDetailContent from './project-detail-content';
import type { AgentStudioAgentId } from '../../lib/agents';

interface Props {
	projectId?: string;
}

export default function AgentStudioProjectDetail( { projectId }: Props ) {
	const dispatch = useDispatch();
	const { data: project, isLoading } = useAgentStudioProject( projectId );
	const title = project?.name ?? __( 'Project' );
	const [ isDeleteDialogOpen, setIsDeleteDialogOpen ] = useState( false );
	const [ isAgentPickerOpen, setIsAgentPickerOpen ] = useState( false );

	const openDeleteDialog = useCallback( () => {
		setIsDeleteDialogOpen( true );
	}, [] );

	const closeDeleteDialog = useCallback( () => {
		setIsDeleteDialogOpen( false );
	}, [] );

	const onDeleted = useCallback( () => {
		setIsDeleteDialogOpen( false );
		pageRouter( getAgentStudioPath() );
	}, [] );

	const openAgentPicker = useCallback( () => {
		dispatch(
			recordTracksEvent( 'calypso_a4a_agent_studio_new_deliverable_click', {
				project_id: projectId,
			} )
		);
		setIsAgentPickerOpen( true );
	}, [ dispatch, projectId ] );

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
		<Layout title={ title } wide className="a4a-agent-studio-project-detail">
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
								label: title,
							},
						] }
					/>
					<Actions>
						<MobileSidebarNavigation />
						{ project && (
							<DropdownMenu
								icon={ moreVertical }
								label={ __( 'Project actions' ) }
								controls={ [
									{
										title: __( 'Delete project' ),
										icon: trash,
										onClick: openDeleteDialog,
									},
								] }
							/>
						) }
						<Button variant="primary" icon={ plus } onClick={ openAgentPicker }>
							{ __( 'New deliverable' ) }
						</Button>
					</Actions>
				</LayoutHeader>
			</LayoutTop>
			<LayoutBody>
				{ isLoading ? (
					<PageBodyPlaceholder />
				) : (
					<ProjectDetailContent
						projectId={ projectId }
						project={ project }
						onBriefAgent={ openAgentPicker }
					/>
				) }
			</LayoutBody>
			{ isDeleteDialogOpen && project && (
				<DeleteProjectDialog
					project={ project }
					onClose={ closeDeleteDialog }
					onDeleted={ onDeleted }
				/>
			) }
			{ isAgentPickerOpen && (
				<AgentPickerModal onClose={ closeAgentPicker } onPick={ onPickAgent } />
			) }
		</Layout>
	);
}
