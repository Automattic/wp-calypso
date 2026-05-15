import {
	Button,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __, _n, sprintf } from '@wordpress/i18n';
import { Icon, brush, page } from '@wordpress/icons';
import { useCallback } from 'react';
import A4AEmptyState from 'calypso/a8c-for-agencies/components/a4a-empty-state';
import A4AIntroVideoStrip from 'calypso/a8c-for-agencies/components/a4a-intro-video-strip';
import { PageBodyPlaceholder } from 'calypso/a8c-for-agencies/components/page-placeholder';
import DashboardSummaryButton from 'calypso/dashboard/components/summary-button';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import useAgentStudioProjects from '../../data/use-agent-studio-projects';
import useAgentStudioWelcomeVideos from '../../data/use-agent-studio-welcome-videos';
import { getAgentStudioProjectPath } from '../../lib/paths';
import type { AgentStudioProjectSummary } from '../../types';

interface Props {
	onCreateProject: () => void;
}

export default function AgentStudioOverviewContent( { onCreateProject }: Props ) {
	const { data: projects, isLoading } = useAgentStudioProjects();
	const welcomeVideos = useAgentStudioWelcomeVideos();

	return (
		<VStack spacing={ 6 }>
			<A4AIntroVideoStrip
				title={ __( 'Welcome to Agent studio' ) }
				subtitle={ __(
					'AI agents that create sales decks, social graphics, and more for your agency.'
				) }
				videos={ welcomeVideos }
				dismissPreferenceKey="a4a_agent_studio_welcome_strip_dismissed"
				tracksEventPrefix="calypso_a4a_agent_studio_welcome_strip"
			/>

			<VStack spacing={ 4 }>
				<Text size={ 15 } weight={ 600 }>
					{ __( 'Your projects' ) }
				</Text>

				{ isLoading && <PageBodyPlaceholder /> }

				{ ! isLoading && projects?.length === 0 && (
					<A4AEmptyState
						icon={ brush }
						title={ __( 'Create your first project' ) }
						description={ __(
							'Organize client work into projects and keep every generated output in one place.'
						) }
					>
						<Button variant="tertiary" onClick={ onCreateProject }>
							{ __( 'Create project' ) }
						</Button>
					</A4AEmptyState>
				) }

				{ ! isLoading && !! projects?.length && (
					<VStack spacing={ 3 }>
						{ projects.map( ( project ) => (
							<ProjectSummaryButton key={ project.id } project={ project } />
						) ) }
					</VStack>
				) }
			</VStack>
		</VStack>
	);
}

function ProjectSummaryButton( { project }: { project: AgentStudioProjectSummary } ) {
	const dispatch = useDispatch();
	const deliverableCountLabel = sprintf(
		/* translators: %d is the number of deliverables in an Agent Studio project. */
		_n( '%d deliverable', '%d deliverables', project.outputCount ),
		project.outputCount
	);

	const description = project.latestOutput
		? sprintf(
				/* translators: %(agentName)s is an AI agent name, %(outputTitle)s is a deliverable title. */
				__( 'Latest: %(agentName)s created %(outputTitle)s.' ),
				{
					agentName: project.latestOutput.agentName,
					outputTitle: project.latestOutput.title,
				}
		  )
		: __( 'Nothing made yet.' );

	const onClick = useCallback( () => {
		dispatch(
			recordTracksEvent( 'calypso_a4a_agent_studio_project_click', {
				project_id: project.id,
			} )
		);
	}, [ dispatch, project.id ] );

	return (
		<DashboardSummaryButton
			title={ project.name }
			description={
				project.clientName ? `${ project.clientName } · ${ description }` : description
			}
			decoration={ <Icon icon={ page } size={ 24 } /> }
			badges={ [ { text: deliverableCountLabel } ] }
			href={ getAgentStudioProjectPath( project.id ) }
			onClick={ onClick }
		/>
	);
}
