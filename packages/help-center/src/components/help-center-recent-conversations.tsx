import { recordTracksEvent } from '@automattic/calypso-analytics';
import { TimeSince } from '@automattic/components';
import SummaryButton from '@automattic/components/src/summary-button';
import { __ } from '@wordpress/i18n';
import { Icon } from '@wordpress/icons';
import clsx from 'clsx';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useHelpCenterContext } from '../contexts/HelpCenterContext';
import { useGetHistoryChats } from '../hooks';
import { getChatLinkFromConversation, getLastMessage } from './utils';
import './help-center-recent-conversations.scss';

const trackContactButtonClicked = ( sectionName: string ) => {
	recordTracksEvent( 'calypso_inlinehelp_support_chat_message_click', {
		force_site_id: true,
		location: 'help-center',
		section: sectionName,
	} );
};

const HelpCenterRecentConversations: React.FC = () => {
	const { recentConversations } = useGetHistoryChats();
	const navigate = useNavigate();
	const { sectionName } = useHelpCenterContext();

	if ( ! recentConversations?.length ) {
		return null;
	}

	const recentConversation = recentConversations[ 0 ];

	const lastMessage = getLastMessage( {
		conversation: recentConversation,
	} );

	if ( ! lastMessage ) {
		return null;
	}
	const messageDisplayName = lastMessage
		? __( 'Happiness chat', __i18n_text_domain__ )
		: __( 'Support assistant chat', __i18n_text_domain__ );

	const receivedDateISO = (
		! lastMessage.received ? new Date() : new Date( lastMessage.received * 1000 )
	).toISOString();

	const chatLink = getChatLinkFromConversation( recentConversation );
	const isUnread =
		'participants' in recentConversation &&
		( recentConversation.participants?.[ 0 ]?.unreadCount ?? 0 ) > 0;

	return (
		<SummaryButton
			className={ clsx( {
				'has-unread-conversation': isUnread,
			} ) }
			strapline={ __( 'Recent Conversation', __i18n_text_domain__ ) }
			title={ lastMessage.text || '' }
			description={
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
			}
			onClick={ () => {
				trackContactButtonClicked( sectionName );
				navigate( chatLink );
			} }
		/>
	);
};

export default HelpCenterRecentConversations;
