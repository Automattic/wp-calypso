import { HelpCenterSelect } from '@automattic/data-stores';
import { useSmooch } from '@automattic/zendesk-client';
import { TabPanel } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { useEffect, useState } from '@wordpress/element';
import { useI18n } from '@wordpress/react-i18n';
import { HELP_CENTER_STORE } from '../stores';
import { HelpCenterSupportChatMessage } from './help-center-support-chat-message';
import type { ZendeskConversation } from '@automattic/odie-client';

import './help-center-chat-history.scss';

export const HelpCenterChatHistory = () => {
	const { __ } = useI18n();
	const TAB_STATES = {
		recent: 'recent',
		archived: 'archived',
	};

	const [ activeTab, setActiveTab ] = useState( TAB_STATES.recent );
	const [ conversations, setConversations ] = useState< ZendeskConversation[] >( [] );
	const { getConversations } = useSmooch();
	const { isChatLoaded } = useSelect( ( select ) => {
		const store = select( HELP_CENTER_STORE ) as HelpCenterSelect;
		return { isChatLoaded: store.getIsChatLoaded() };
	}, [] );

	useEffect( () => {
		if ( isChatLoaded && getConversations ) {
			setConversations( getConversations() as ZendeskConversation[] );
		}
	}, [ getConversations, isChatLoaded ] );

	const RecentConversations = ( { conversations }: { conversations: ZendeskConversation[] } ) => {
		if ( ! conversations ) {
			return [];
		}

		return (
			<>
				{ conversations.map( ( conversation ) => {
					const lastMessage =
						Array.isArray( conversation.messages ) && conversation.messages.length > 0
							? conversation.messages[ conversation.messages.length - 1 ]
							: null;

					if ( lastMessage ) {
						return (
							<HelpCenterSupportChatMessage
								navigateTo={ `/odie/${ conversation.id }` }
								key={ conversation.id }
								message={ lastMessage }
								isUnread={ conversation.participants[ 0 ]?.unreadCount > 0 }
							/>
						);
					}
				} ) }
			</>
		);
	};

	return (
		<div className="help-center-chat-history">
			<TabPanel
				tabs={ [
					{
						name: TAB_STATES.recent,
						title: __( 'Recent' ),
						className: 'help-center-chat-history__recent',
					},
					{
						name: TAB_STATES.archived,
						title: __( 'Archived' ),
						className: 'help-center-chat-history__archived',
					},
				] }
				onSelect={ () => {
					setActiveTab( activeTab );
				} }
			>
				{ ( tab ) => {
					switch ( tab.name ) {
						case TAB_STATES.recent:
							return <RecentConversations conversations={ conversations } />;
						case TAB_STATES.archived:
							return (
								<div className="help-center-chat-history__no-results">
									{ __( 'Nothing found…' ) }
								</div>
							);
						default:
							return;
					}
				} }
			</TabPanel>
		</div>
	);
};
