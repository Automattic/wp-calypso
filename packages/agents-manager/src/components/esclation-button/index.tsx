import { SummaryButton } from '@automattic/components';
import { __ } from '@wordpress/i18n';
import './style.scss';
import { useNavigate } from 'react-router-dom';

export function EscalationButton( { sessionId }: { sessionId: string } ) {
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
