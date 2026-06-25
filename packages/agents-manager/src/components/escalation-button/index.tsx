import { SummaryButton, TimeSince } from '@automattic/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useNavigate } from 'react-router-dom';
import { useAgentsManagerContext } from '../../contexts';
import './style.scss';

function getExistingConversationButtonDescription( startedAt?: string ) {
	if ( ! startedAt ) {
		return __( 'Return to your human chat' );
	}

	return createInterpolateElement( __( 'Continue chat started <time></time>' ), {
		time: <TimeSince className="agents-manager__escalation-button-time" date={ startedAt } />,
	} );
}

export function EscalationButton( {
	messageId,
	zendeskTicketId,
	escalatedAt,
}: {
	messageId: string;
	zendeskTicketId?: number | string;
	escalatedAt?: string;
} ) {
	const { getActiveSessionId } = useAgentsManagerContext();
	const navigate = useNavigate();
	const hasExistingConversation = zendeskTicketId !== undefined && zendeskTicketId !== null;

	return (
		<SummaryButton
			className="agents-manager__escalation-button"
			title={
				hasExistingConversation
					? __( 'Continue existing chat' )
					: __( 'Switch to Happiness Engineer' )
			}
			description={
				hasExistingConversation
					? getExistingConversationButtonDescription( escalatedAt )
					: __( 'A new chat will start' )
			}
			onClick={ () => {
				const currentChatSessionId = getActiveSessionId();

				navigate( '/zendesk', {
					state: hasExistingConversation
						? { zendeskTicketId }
						: { startedFromChatId: currentChatSessionId, startedFromMessageId: messageId },
				} );
			} }
		/>
	);
}
