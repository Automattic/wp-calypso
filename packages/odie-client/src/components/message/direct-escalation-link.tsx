import { useCallback } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useNavigate } from 'react-router-dom';
import { useOdieAssistantContext } from '../../context';
import { useCreateZendeskConversation } from '../../hooks';
import { getHelpCenterZendeskConversationStarted } from '../../utils';

export const DirectEscalationLink = ( { messageId }: { messageId: number | undefined } ) => {
	const conversationStarted = Boolean( getHelpCenterZendeskConversationStarted() );
	const newConversation = useCreateZendeskConversation();
	const { trackEvent, isUserEligibleForPaidSupport } = useOdieAssistantContext();
	const navigate = useNavigate();

	const handleClick = useCallback( () => {
		trackEvent( 'chat_message_direct_escalation_link_click', {
			message_id: messageId,
			is_user_eligible_for_paid_support: isUserEligibleForPaidSupport,
		} );

		if ( isUserEligibleForPaidSupport ) {
			if ( conversationStarted ) {
				return;
			}
			newConversation();
		} else {
			navigate( '/contact-form?mode=FORUM' );
		}
	}, [
		trackEvent,
		messageId,
		isUserEligibleForPaidSupport,
		conversationStarted,
		newConversation,
		navigate,
	] );

	return (
		<div className="disclaimer">
			{ __( 'Feeling stuck?', __i18n_text_domain__ ) }{ ' ' }
			<button onClick={ handleClick } className="odie-button-link" disabled={ conversationStarted }>
				{ isUserEligibleForPaidSupport
					? __( 'Contact our support team.', __i18n_text_domain__ )
					: __( 'Ask in our forums.', __i18n_text_domain__ ) }
			</button>
		</div>
	);
};
