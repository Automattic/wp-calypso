import {
	Button,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __, _n, sprintf } from '@wordpress/i18n';
import { page } from '@wordpress/icons';
import A4AEmptyState from 'calypso/a8c-for-agencies/components/a4a-empty-state';
import A4AIntroVideoStrip from 'calypso/a8c-for-agencies/components/a4a-intro-video-strip';
import { PageBodyPlaceholder } from 'calypso/a8c-for-agencies/components/page-placeholder';
import useAgentStudioOutputs from '../../data/use-agent-studio-outputs';
import useAgentStudioWelcomeVideos from '../../data/use-agent-studio-welcome-videos';
import DeliverableCard from './deliverable-card';

import './style.scss';

interface Props {
	onCreateDeliverable: () => void;
}

export default function AgentStudioOverviewContent( { onCreateDeliverable }: Props ) {
	const { data: outputs, isLoading } = useAgentStudioOutputs();
	const welcomeVideos = useAgentStudioWelcomeVideos();

	return (
		<VStack spacing={ 6 }>
			<A4AIntroVideoStrip
				title={ __( 'Welcome to Agent studio' ) }
				subtitle={ __( 'AI agents that create PDFs, social graphics, and more for your agency.' ) }
				videos={ welcomeVideos }
				dismissPreferenceKey="a4a_agent_studio_welcome_strip_dismissed"
				tracksEventPrefix="calypso_a4a_agent_studio_welcome_strip"
			/>

			<VStack spacing={ 3 }>
				<HStack alignment="center" justify="space-between">
					<Text size={ 15 } weight={ 600 }>
						{ __( 'Deliverables' ) }
					</Text>
					{ !! outputs?.length && (
						<Text variant="muted">
							{ sprintf(
								/* translators: %d is the number of deliverables. */
								_n( '%d deliverable', '%d deliverables', outputs.length ),
								outputs.length
							) }
						</Text>
					) }
				</HStack>

				{ isLoading && <PageBodyPlaceholder /> }

				{ ! isLoading && outputs?.length === 0 && (
					<A4AEmptyState
						icon={ page }
						title={ __( 'Make your first deliverable' ) }
						description={ __( 'PDFs, social graphics, and more. Everything you make lands here.' ) }
					>
						<Button variant="tertiary" onClick={ onCreateDeliverable }>
							{ __( 'New deliverable' ) }
						</Button>
					</A4AEmptyState>
				) }

				{ ! isLoading && !! outputs?.length && (
					<div className="a4a-agent-studio-deliverables-grid">
						{ outputs.map( ( output ) => (
							<DeliverableCard key={ output.id } output={ output } />
						) ) }
					</div>
				) }
			</VStack>
		</VStack>
	);
}
