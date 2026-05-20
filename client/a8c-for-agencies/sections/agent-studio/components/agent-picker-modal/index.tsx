import {
	Modal,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { Icon } from '@wordpress/icons';
import DashboardSummaryButton from 'calypso/dashboard/components/summary-button';
import { useAgentStudioAgents, type AgentStudioAgentId } from '../../lib/agents';

import './style.scss';

interface Props {
	onClose: () => void;
	onPick: ( agentId: AgentStudioAgentId ) => void;
}

export default function AgentPickerModal( { onClose, onPick }: Props ) {
	const agents = useAgentStudioAgents();

	return (
		<Modal
			title={ __( 'What do you want to create?' ) }
			onRequestClose={ onClose }
			className="a4a-agent-studio-agent-picker-modal"
		>
			<VStack spacing={ 4 }>
				<Text variant="muted">
					{ __( 'Pick a deliverable and an agent will design it for you.' ) }
				</Text>
				<VStack spacing={ 3 }>
					{ agents.map( ( agent ) => (
						<DashboardSummaryButton
							key={ agent.id }
							density="low"
							strapline={ sprintf(
								/* translators: %s is an agent name. */
								__( 'Designed by %s' ),
								agent.name
							) }
							title={ agent.deliverableType }
							description={ agent.description }
							decoration={
								agent.previewImage ? (
									<img src={ agent.previewImage } alt="" />
								) : (
									<Icon icon={ agent.icon } size={ 28 } />
								)
							}
							badges={ agent.disabled ? [ { text: __( 'Joining soon' ) } ] : undefined }
							disabled={ agent.disabled }
							onClick={ agent.disabled ? undefined : () => onPick( agent.id ) }
						/>
					) ) }
				</VStack>
			</VStack>
		</Modal>
	);
}
