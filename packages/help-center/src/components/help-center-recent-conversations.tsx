import { calculateUnread } from '@automattic/odie-client/src/data/use-get-unread-conversations';
import { ZendeskConversation } from '@automattic/odie-client/src/types';
import { useI18n } from '@wordpress/react-i18n';
import React from 'react';
import { useGetHistoryChats } from '../hooks';
import { HelpCenterSupportChatMessage } from './help-center-support-chat-message';
import { getLastMessage } from './utils';

import './help-center-recent-conversations.scss';

const HelpCenterRecentConversations: React.FC = () => {
	const { recentConversations } = useGetHistoryChats();
	const { __ } = useI18n();

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

	const { numberOfUnreadMessages } = calculateUnread( [
		recentConversation as ZendeskConversation,
	] );

	return (
		<div className="help-center-homepage-conversations">
			<h3 className="help-center-search-results__title help-center__section-title">
				{ __( 'Recent Conversation', __i18n_text_domain__ ) }
			</h3>

			<HelpCenterSupportChatMessage
				numberOfUnreadMessages={ numberOfUnreadMessages }
				sectionName="recent_conversations"
				key={ recentConversation.id }
				message={ lastMessage }
				conversation={ recentConversation }
			/>
		</div>
	);
};

export default HelpCenterRecentConversations;
