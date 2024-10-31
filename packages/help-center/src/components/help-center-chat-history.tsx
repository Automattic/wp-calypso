/* eslint-disable no-restricted-imports */
import { HelpCenterSelect } from '@automattic/data-stores';
import { useSmooch } from '@automattic/zendesk-client';
import { useSelect, useDispatch as useDataStoreDispatch } from '@wordpress/data';
import { useEffect, useState } from '@wordpress/element';
import { useI18n } from '@wordpress/react-i18n';
import SectionNav from 'calypso/components/section-nav';
import NavItem from 'calypso/components/section-nav/item';
import NavTabs from 'calypso/components/section-nav/tabs';
import { HELP_CENTER_STORE } from '../stores';
import { HelpCenterSupportChatMessage } from './help-center-support-chat-message';
import { getFilteredConversations, getLastMessage, calculateUnread } from './utils';
import type { ZendeskConversation } from '@automattic/odie-client';

import './help-center-chat-history.scss';

const Conversations = ( { conversations }: { conversations: ZendeskConversation[] } ) => {
	const { __ } = useI18n();
	if ( ! conversations || ! conversations.length ) {
		return <div className="help-center-chat-history__no-results">{ __( 'Nothing found…' ) }</div>;
	}

	return (
		<>
			{ conversations.map( ( conversation ) => {
				const lastMessage = getLastMessage( { conversation } );

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

export const HelpCenterChatHistory = () => {
	const { __ } = useI18n();
	const TAB_STATES = {
		recent: 'recent',
		archived: 'archived',
	};

	const [ conversations, setConversations ] = useState< ZendeskConversation[] >( [] );
	const [ selectedTab, setSelectedTab ] = useState( TAB_STATES.recent );
	const { getConversations } = useSmooch();
	const { isChatLoaded, unreadCount } = useSelect( ( select ) => {
		const store = select( HELP_CENTER_STORE ) as HelpCenterSelect;
		return {
			isChatLoaded: store.getIsChatLoaded(),
			unreadCount: store.getUnreadCount(),
		};
	}, [] );

	const { recentConversations, archivedConversations } = getFilteredConversations( {
		conversations,
	} );
	const { setUnreadCount } = useDataStoreDispatch( HELP_CENTER_STORE );

	useEffect( () => {
		if ( isChatLoaded && getConversations ) {
			const conversations = getConversations() as ZendeskConversation[];
			setConversations( conversations );

			const { unreadConversations } = calculateUnread( conversations );
			setUnreadCount( unreadConversations );
		}
	}, [ getConversations, isChatLoaded ] );

	return (
		<div className="help-center-chat-history">
			<SectionNav>
				<NavTabs>
					<NavItem
						selected={ selectedTab === TAB_STATES.recent }
						onClick={ () => setSelectedTab( TAB_STATES.recent ) }
						count={ unreadCount > 0 ? unreadCount : undefined }
					>
						{ __( 'Recent' ) }
					</NavItem>
					<NavItem
						selected={ selectedTab === TAB_STATES.archived }
						onClick={ () => setSelectedTab( TAB_STATES.archived ) }
					>
						{ __( 'Archived' ) }
					</NavItem>
				</NavTabs>
			</SectionNav>

			{ selectedTab === TAB_STATES.recent && (
				<Conversations conversations={ recentConversations } />
			) }

			{ selectedTab === TAB_STATES.archived && (
				<Conversations conversations={ archivedConversations } />
			) }
		</div>
	);
};
