import { HelpCenterSelect } from '@automattic/data-stores';
import { HELP_CENTER_STORE } from '@automattic/help-center/src/stores';
import { Button } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { comment, Icon } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessagesContainer } from './components/message/messages-container';
import { OdieSendMessageButton } from './components/send-message-input';
import { useOdieAssistantContext, OdieAssistantProvider } from './context';
import { useManageSupportInteraction } from './data';
import { interactionHasEnded, interactionHasZendeskEvent } from './utils';

import './style.scss';

export const OdieAssistant: React.FC = () => {
	const { __ } = useI18n();
	const navigate = useNavigate();
	const { trackEvent, currentUser, forceEmailSupport } = useOdieAssistantContext();
	const { currentSupportInteraction } = useSelect( ( select ) => {
		const store = select( HELP_CENTER_STORE ) as HelpCenterSelect;
		return {
			currentSupportInteraction: store.getCurrentSupportInteraction(),
		};
	}, [] );
	const { startNewInteraction } = useManageSupportInteraction();

	const showClosedConversationFooter = interactionHasEnded( currentSupportInteraction );
	const showMaintenanceFooter =
		forceEmailSupport &&
		interactionHasZendeskEvent( currentSupportInteraction ) &&
		! showClosedConversationFooter;

	useEffect( () => {
		trackEvent( 'chatbox_view' );
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );

	const renderFooter = () => {
		if ( showMaintenanceFooter ) {
			return (
				<div className="odie-closed-conversation-footer">
					<Button
						onClick={ () => {
							trackEvent( 'chat_maintenance_email_support_click' );
							navigate( '/contact-form?mode=EMAIL&wapuuFlow=true' );
						} }
						className="odie-closed-conversation-footer__button"
					>
						<Icon icon={ comment } />
						{ __( 'Support under maintenance, switch to email support', __i18n_text_domain__ ) }
					</Button>
				</div>
			);
		}
		if ( showClosedConversationFooter ) {
			return (
				<div className="odie-closed-conversation-footer">
					<Button
						onClick={ () => {
							trackEvent( 'chat_new_from_closed_conversation' );
							startNewInteraction( {
								event_source: 'help-center',
								event_external_id: crypto.randomUUID(),
							} );
						} }
						className="odie-closed-conversation-footer__button"
					>
						<Icon icon={ comment } />
						{ __( 'New conversation', __i18n_text_domain__ ) }
					</Button>
				</div>
			);
		}
		return <OdieSendMessageButton />;
	};

	return (
		<div className="chatbox">
			<div className="chat-box-message-container" id="odie-messages-container">
				<MessagesContainer currentUser={ currentUser } />
			</div>
			{ renderFooter() }
		</div>
	);
};

export default OdieAssistantProvider;
export { useOdieAssistantContext } from './context';
export { EllipsisMenu } from './components/ellipsis-menu';
export { NewThirdPartyCookiesNotice } from './components/message/get-support';
export type {
	Conversations,
	OdieConversation,
	OdieMessage,
	SupportInteraction,
	ZendeskConversation,
	ZendeskMessage,
} from './types';
