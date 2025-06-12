import { HelpCenterSelect } from '@automattic/data-stores';
import { HELP_CENTER_STORE } from '@automattic/help-center/src/stores';
import { useSelect } from '@wordpress/data';
import { useCallback, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useNavigate } from 'react-router-dom';
import { useOdieAssistantContext } from '../../context';
import { useCreateZendeskConversation } from '../../hooks';
import { getHelpCenterZendeskConversationStarted, interactionHasZendeskEvent } from '../../utils';

export const DirectEscalationLink = ( { messageId }: { messageId: number | undefined } ) => {
	const conversationStarted = Boolean( getHelpCenterZendeskConversationStarted() );
	const createZendeskConversation = useCreateZendeskConversation();
	const { trackEvent, isUserEligibleForPaidSupport, chat, canConnectToZendesk, forceEmailSupport } =
		useOdieAssistantContext();
	const navigate = useNavigate();

	const { currentSupportInteraction } = useSelect( ( select ) => {
		const store = select( HELP_CENTER_STORE ) as HelpCenterSelect;
		return {
			currentSupportInteraction: store.getCurrentSupportInteraction(),
		};
	}, [] );

	const [ hideNewConversationButton, setHideNewConversationButton ] =
		useState( conversationStarted );

	const handleClick = useCallback( () => {
		setHideNewConversationButton( true );

		const hasZendeskConversationAlreadyStarted =
			interactionHasZendeskEvent( currentSupportInteraction );

		trackEvent( 'chat_message_direct_escalation_link_click', {
			message_id: messageId,
			is_user_eligible_for_paid_support: isUserEligibleForPaidSupport,
			chat_provider: chat?.provider,
			conversation_id: chat?.conversationId,
			has_zendesk_conversation_already_started: hasZendeskConversationAlreadyStarted,
		} );

		if ( hasZendeskConversationAlreadyStarted ) {
			return;
		}

		if ( isUserEligibleForPaidSupport ) {
			if ( conversationStarted ) {
				return;
			}
			if ( forceEmailSupport ) {
				navigate( '/contact-form?mode=EMAIL&wapuuFlow=true' );
				return;
			}
			createZendeskConversation( { createdFrom: 'direct_escalation' } );
		} else {
			navigate( '/contact-form?mode=FORUM' );
		}
	}, [
		trackEvent,
		messageId,
		isUserEligibleForPaidSupport,
		conversationStarted,
		createZendeskConversation,
		navigate,
		chat?.provider,
		currentSupportInteraction,
		chat?.conversationId,
		forceEmailSupport,
	] );

	if ( hideNewConversationButton ) {
		return null;
	}

	const getButtonText = () => {
		if ( isUserEligibleForPaidSupport && canConnectToZendesk ) {
			return forceEmailSupport
				? __( 'Contact our support team by email.', __i18n_text_domain__ )
				: __( 'Contact our support team.', __i18n_text_domain__ );
		}
		return __( 'Ask in our forums.', __i18n_text_domain__ );
	};

	return (
		<div className="disclaimer">
			{ __( 'Feeling stuck?', __i18n_text_domain__ ) }{ ' ' }
			<button onClick={ handleClick } className="odie-button-link">
				{ getButtonText() }
			</button>
		</div>
	);
};
