import { useI18n } from '@wordpress/react-i18n';
import React from 'react';
import { useGetHistoryChats } from '../hooks';
import { HelpCenterSupportChatMessage } from './help-center-support-chat-message';
import { getLastMessageAndUnread } from './utils';

import './help-center-recent-conversations.scss';

const HelpCenterRecentConversations: React.FC = () => {
	const { isLoadingInteractions, recentConversations } = useGetHistoryChats();
	const { __ } = useI18n();

	if ( isLoadingInteractions || ! recentConversations.length ) {
		return null;
	}

	const recentConversation = recentConversations[ 0 ];

	const { lastMessage, unreadMessages } = getLastMessageAndUnread( {
		conversation: recentConversation,
	} );

	if ( ! lastMessage ) {
		return null;
	}

	return (
		<div className="help-center-homepage-conversations">
			<h3 className="help-center-search-results__title help-center__section-title">
				{ __( 'Recent Conversation', __i18n_text_domain__ ) }
			</h3>

			<HelpCenterSupportChatMessage
				unreadMessages={ unreadMessages }
				sectionName="recent_conversations"
				key={ recentConversation.id }
				message={ lastMessage }
				conversation={ recentConversation }
			/>
		</div>
	);
};

export default HelpCenterRecentConversations;
