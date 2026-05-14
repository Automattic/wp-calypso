import {
	Button,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __, _n, sprintf } from '@wordpress/i18n';
import { Icon, brush, page } from '@wordpress/icons';
import A4AEmptyState from 'calypso/a8c-for-agencies/components/a4a-empty-state';
import { PageBodyPlaceholder } from 'calypso/a8c-for-agencies/components/page-placeholder';
import DashboardSummaryButton from 'calypso/dashboard/components/summary-button';
import useAgentStudioProjectOutputs from '../../data/use-agent-studio-project-outputs';
import { getAgentStudioPath } from '../../lib/paths';
import type { AgentStudioOutput, AgentStudioProject } from '../../types';

import './style.scss';

interface Props {
	projectId?: string;
	project?: AgentStudioProject;
	onBriefAgent: () => void;
}

export default function ProjectDetailContent( { projectId, project, onBriefAgent }: Props ) {
	const { data: outputs, isLoading } = useAgentStudioProjectOutputs( projectId );

	if ( ! project ) {
		return (
			<A4AEmptyState
				icon={ brush }
				title={ __( 'Project not found' ) }
				description={ __( 'The project may have been removed or the link may be incorrect.' ) }
			>
				<Button variant="primary" href={ getAgentStudioPath() }>
					{ __( 'Back to Agent studio' ) }
				</Button>
			</A4AEmptyState>
		);
	}

	return (
		<VStack spacing={ 6 } className="a4a-agent-studio-project-detail__content">
			<VStack spacing={ 2 }>
				{ project.clientName && (
					<Text weight={ 600 } className="a4a-agent-studio-project-detail__client-name">
						{ project.clientName }
					</Text>
				) }
				{ project.brief && <Text>{ project.brief }</Text> }
			</VStack>

			<VStack spacing={ 3 }>
				<HStack alignment="center" justify="space-between">
					<Text weight={ 600 }>{ __( 'Deliverables' ) }</Text>
					<Text variant="muted">
						{ outputs && outputs.length > 0
							? sprintf(
									/* translators: %d is the number of deliverables in an Agent Studio project. */
									_n( '%d deliverable', '%d deliverables', outputs.length ),
									outputs.length
							  )
							: __( 'Nothing made yet' ) }
					</Text>
				</HStack>

				{ isLoading && <PageBodyPlaceholder /> }

				{ ! isLoading && outputs?.length === 0 && (
					<A4AEmptyState
						icon={ page }
						title={ __( 'Brief your first agent' ) }
						description={ __(
							'Agents create sales decks, social graphics, and more. Their work lands here.'
						) }
					>
						<Button variant="tertiary" onClick={ onBriefAgent }>
							{ __( 'Brief an agent' ) }
						</Button>
					</A4AEmptyState>
				) }

				{ ! isLoading &&
					outputs?.map( ( output ) => (
						<OutputSummaryButton key={ output.id } output={ output } />
					) ) }
			</VStack>
		</VStack>
	);
}

function OutputSummaryButton( { output }: { output: AgentStudioOutput } ) {
	const statusLabel = getStatusLabel( output );

	return (
		<DashboardSummaryButton
			title={ output.title }
			description={ output.description }
			decoration={ <Icon icon={ page } size={ 24 } /> }
			badges={ [
				{ text: output.agentName },
				{ text: output.deliverableType },
				{ text: statusLabel, intent: output.status === 'failed' ? 'error' : undefined },
			] }
		/>
	);
}

function getStatusLabel( output: AgentStudioOutput ) {
	switch ( output.status ) {
		case 'ready':
			return __( 'Ready' );
		case 'generating':
			return __( 'Generating' );
		case 'failed':
			return __( 'Failed' );
	}
}
