import pageRouter from '@automattic/calypso-router';
import {
	Button,
	DropdownMenu,
	Modal,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
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
import useAgentStudioProject from '../../data/use-agent-studio-project';
import { getAgentStudioPath } from '../../lib/paths';
import DeleteProjectDialog from './delete-project-dialog';
import ProjectDetailContent from './project-detail-content';

interface Props {
	projectId?: string;
}

export default function AgentStudioProjectDetail( { projectId }: Props ) {
	const dispatch = useDispatch();
	const { data: project, isLoading } = useAgentStudioProject( projectId );
	const title = project?.name ?? __( 'Project' );
	const [ isDeleteDialogOpen, setIsDeleteDialogOpen ] = useState( false );
	const [ isComingSoonOpen, setIsComingSoonOpen ] = useState( false );

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

	const openComingSoon = useCallback( () => {
		dispatch(
			recordTracksEvent( 'calypso_a4a_agent_studio_brief_agent_click', {
				project_id: projectId,
			} )
		);
		setIsComingSoonOpen( true );
	}, [ dispatch, projectId ] );

	const closeComingSoon = useCallback( () => {
		setIsComingSoonOpen( false );
	}, [] );

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
						<Button variant="primary" icon={ plus } onClick={ openComingSoon }>
							{ __( 'Brief an agent' ) }
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
						onBriefAgent={ openComingSoon }
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
			{ isComingSoonOpen && <BriefAgentComingSoonModal onClose={ closeComingSoon } /> }
		</Layout>
	);
}

function BriefAgentComingSoonModal( { onClose }: { onClose: () => void } ) {
	return (
		<Modal
			title={ __( 'Coming soon' ) }
			onRequestClose={ onClose }
			className="a4a-agent-studio-coming-soon-modal"
			size="small"
		>
			<VStack spacing={ 4 }>
				<Text>
					{ __(
						'Briefing agents isn’t quite ready yet. We’re putting the finishing touches on it — check back soon.'
					) }
				</Text>
				<HStack justify="flex-end">
					<Button variant="primary" onClick={ onClose }>
						{ __( 'Got it' ) }
					</Button>
				</HStack>
			</VStack>
		</Modal>
	);
}
