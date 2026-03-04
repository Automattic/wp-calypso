import { SummaryButton } from '@automattic/components';
import { __ } from '@wordpress/i18n';
import './style.scss';
import { useNavigate } from 'react-router-dom';
import { useAgentsManagerContext } from '../../contexts';
import { getSessionId as getStoredSessionId } from '../../utils/agent-session';

export function EscalationButton() {
	const { agentConfig } = useAgentsManagerContext();
	const sessionId = agentConfig?.sessionId || getStoredSessionId( agentConfig?.agentId );

	const navigate = useNavigate();
	return (
		<SummaryButton
			className="agents-manager__escalation-button"
			title={ __( 'Switch to Happiness Engineer' ) }
			description={ __( 'A new chat will start' ) }
			onClick={ () => {
				navigate( '/zendesk', { state: { startedFromChatId: sessionId } } );
			} }
		/>
	);
}
