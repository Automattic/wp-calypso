import { SummaryButton } from '@automattic/components';
import { __ } from '@wordpress/i18n';
import { useNavigate } from 'react-router-dom';
import { useAgentsManagerContext } from '../../contexts';
import './style.scss';

export function EscalationButton() {
	const { getActiveSessionId } = useAgentsManagerContext();
	const navigate = useNavigate();

	return (
		<SummaryButton
			className="agents-manager__escalation-button"
			title={ __( 'Switch to Happiness Engineer' ) }
			description={ __( 'A new chat will start' ) }
			onClick={ () => {
				navigate( '/zendesk', { state: { startedFromChatId: getActiveSessionId() } } );
			} }
		/>
	);
}
