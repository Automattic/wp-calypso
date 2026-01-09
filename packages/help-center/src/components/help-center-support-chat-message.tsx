/* eslint-disable no-restricted-imports */
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Gravatar, TimeSince, WordPressLogo } from '@automattic/components';
import { WapuuAvatar } from '@automattic/odie-client/src/assets';
import { chevronRight, Icon } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import clsx from 'clsx';
import { Link } from 'react-router-dom';
import { useHelpCenterContext } from '../contexts/HelpCenterContext';
import { useGetHistoryChats } from '../hooks';
import { getChatLinkFromConversation } from './utils';
import type { OdieConversation, OdieMessage } from '@automattic/odie-client';
import type { ZendeskConversation, ZendeskMessage } from '@automattic/zendesk-client';

import './help-center-support-chat-message.scss';

const trackContactButtonClicked = ( sectionName: string ) => {
	recordTracksEvent( 'calypso_inlinehelp_support_chat_message_click', {
		force_site_id: true,
		location: 'help-center',
		section: sectionName,
	} );
};

export const HelpCenterSupportChatMessage = ( {
	message,
	sectionName,
	conversation,
	numberOfUnreadMessages = 0,
}: {
	message: OdieMessage | ZendeskMessage;
	sectionName?: string;
	conversation: OdieConversation | ZendeskConversation;
	numberOfUnreadMessages?: number;
	homePageVersion?: boolean;
} ) => {
	const { __ } = useI18n();
	const { currentUser } = useHelpCenterContext();
	const { received, role, text, altText } = message;
	const messageText =
		'metadata' in message && message.metadata?.type === 'csat'
			? __(
					'Please help us improve. How would you rate your support experience?',
					__i18n_text_domain__
			  )
			: text;
	const helpCenterContext = useHelpCenterContext();
	const helpCenterContextSectionName = helpCenterContext.sectionName;
	const { supportInteractions } = useGetHistoryChats();

	const supportInteraction = supportInteractions.find(
		( interaction ) => interaction.uuid === conversation.metadata?.supportInteractionId
	);

	const messageDisplayName =
		'id' in message
			? __( 'Happiness chat', __i18n_text_domain__ )
			: __( 'Support assistant chat', __i18n_text_domain__ );

	const renderAvatar = () => {
		if ( role === 'bot' ) {
			return <WapuuAvatar />;
		}

		if ( role === 'business' ) {
			return <WordPressLogo size={ 20 } />;
		}

		return (
			<Gravatar
				user={ currentUser }
				size={ 38 }
				alt={ __( 'User profile display picture', __i18n_text_domain__ ) }
			/>
		);
	};

	const hasUnreadMessages = numberOfUnreadMessages > 0;

	const receivedDateISO = ( ! received ? new Date() : new Date( received * 1000 ) ).toISOString();

	function renderMessage() {
		return (
			<>
				<div
					className={ clsx( 'help-center-support-chat__conversation-avatar', {
						'has-unread-messages': hasUnreadMessages,
					} ) }
				>
					{ renderAvatar() }
					{ hasUnreadMessages && (
						<div className="help-center-support-chat__conversation-badge">
							+{ numberOfUnreadMessages }
						</div>
					) }
				</div>

				<div className="help-center-support-chat__conversation-information">
					<div className="help-center-support-chat__conversation-information-message">
						{ messageText || altText }
					</div>
					<div className="help-center-support-chat__conversation-sub-information">
						<span className="help-center-support-chat__conversation-information-name">
							{ messageDisplayName }
						</span>
						<Icon
							size={ 2 }
							icon={
								<svg
									width="2"
									height="2"
									viewBox="0 0 2 2"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<circle cx="1" cy="1" r="1" fill="#787C82" />
								</svg>
							}
						/>
						<span className="help-center-support-chat__conversation-information-time">
							<TimeSince date={ receivedDateISO } dateFormat="lll" />
						</span>
					</div>
				</div>

				<div className="help-center-support-chat__open-conversation">
					<Icon icon={ chevronRight } size={ 24 } />
				</div>
			</>
		);
	}

	const chatLink = getChatLinkFromConversation( conversation );

	return (
		<Link
			to={ chatLink }
			onClick={ () => {
				trackContactButtonClicked( sectionName || helpCenterContextSectionName );
			} }
			className={ clsx( 'help-center-support-chat__conversation-container', {
				'is-unread-message': hasUnreadMessages,
				[ `is-${ supportInteraction?.status }` ]: supportInteraction?.status,
			} ) }
		>
			{ renderMessage() }
		</Link>
	);
};
