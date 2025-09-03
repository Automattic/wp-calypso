import { useCallback, createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { useLocation, useNavigate } from 'react-router-dom';
import { useOdieAssistantContext } from '../../context';
import { useCurrentSupportInteraction } from '../../data/use-current-support-interaction';
import { useCreateZendeskConversation } from '../../hooks';
import { interactionHasZendeskEvent } from '../../utils';

export const DirectEscalationLink = ( { messageId }: { messageId: number | undefined } ) => {
	const createZendeskConversation = useCreateZendeskConversation();
	const { trackEvent, isUserEligibleForPaidSupport, chat, canConnectToZendesk, forceEmailSupport } =
		useOdieAssistantContext();
	const navigate = useNavigate();
	const { search } = useLocation();

	const { data: currentSupportInteraction } = useCurrentSupportInteraction();

	const handleClick = useCallback( () => {
		const hasZendeskConversationAlreadyStarted =
			interactionHasZendeskEvent( currentSupportInteraction );

		trackEvent( 'chat_message_direct_escalation_link_click', {
			message_id: messageId,
			is_user_eligible_for_paid_support: isUserEligibleForPaidSupport,
			chat_provider: chat?.provider,
			conversation_id: chat?.conversationId,
			has_zendesk_conversation_already_started: hasZendeskConversationAlreadyStarted,
			force_email_support: forceEmailSupport,
		} );

		if ( hasZendeskConversationAlreadyStarted ) {
			return;
		}

		if ( isUserEligibleForPaidSupport ) {
			if ( forceEmailSupport ) {
				navigate( '/contact-form?mode=EMAIL&wapuuFlow=true' );
				return;
			}
			createZendeskConversation( { createdFrom: 'direct_escalation' } );
		} else {
			const params = new URLSearchParams( search );
			params.set( 'mode', 'FORUM' );
			const url = '/contact-form?' + params.toString();
			navigate( url );
		}
	}, [
		search,
		trackEvent,
		messageId,
		isUserEligibleForPaidSupport,
		createZendeskConversation,
		navigate,
		chat?.provider,
		currentSupportInteraction,
		chat?.conversationId,
		forceEmailSupport,
	] );

	const getButtonText = () => {
		if ( isUserEligibleForPaidSupport && canConnectToZendesk ) {
			return forceEmailSupport
				? __( 'Contact our support team by email', __i18n_text_domain__ )
				: __( 'Contact our support team', __i18n_text_domain__ );
		}
		return __( 'Ask in our forums', __i18n_text_domain__ );
	};

	return (
		<div className="disclaimer">
			{ __( 'Feeling stuck?', __i18n_text_domain__ ) }{ ' ' }
			{ createInterpolateElement(
				sprintf( '<button>%(button_text)s</button>.', {
					button_text: getButtonText(),
				} ),
				{
					button: <button onClick={ handleClick } className="odie-button-link" />,
				}
			) }
		</div>
	);
};
