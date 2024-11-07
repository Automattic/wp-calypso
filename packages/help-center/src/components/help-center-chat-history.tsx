/* eslint-disable no-restricted-imports */
import { HelpCenterSelect } from '@automattic/data-stores';
import { useGetSupportInteractions } from '@automattic/odie-client/src/data/use-get-support-interactions';
import { useSmooch } from '@automattic/zendesk-client';
import { Card, CardHeader, CardBody } from '@wordpress/components';
import { useSelect, useDispatch as useDataStoreDispatch } from '@wordpress/data';
import { useEffect, useState } from '@wordpress/element';
import { comment, Icon } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { Link } from 'react-router-dom';
import SectionNav from 'calypso/components/section-nav';
import NavItem from 'calypso/components/section-nav/item';
import NavTabs from 'calypso/components/section-nav/tabs';
import { HELP_CENTER_STORE } from '../stores';
import { HelpCenterSupportChatMessage } from './help-center-support-chat-message';
import { getFilteredConversations, getLastMessage, calculateUnread } from './utils';
import type { ZendeskConversation, SupportInteraction } from '@automattic/odie-client';

import './help-center-chat-history.scss';

// temporarily we want to show a simplified version of the chat history
// this bool controls it.
const simplifiedHistoryChat = true;

const Conversations = ( {
	conversations,
}: {
	conversations: [ SupportInteraction, ZendeskConversation ][];
} ) => {
	const { __ } = useI18n();
	const { setCurrentSupportInteraction } = useDataStoreDispatch( HELP_CENTER_STORE );

	if ( ! conversations || ! conversations.length ) {
		return (
			<div className="help-center-chat-history__no-results">
				{ __( 'Nothing found…', __i18n_text_domain__ ) }
			</div>
		);
	}

	const handleClick = ( supportInteraction: SupportInteraction ) => {
		if ( supportInteraction ) {
			setCurrentSupportInteraction( supportInteraction );
		}
	};

	return (
		<>
			{ conversations.map( ( [ interaction, conversation ] ) => {
				const lastMessage = getLastMessage( { conversation } );

				if ( lastMessage ) {
					return (
						<HelpCenterSupportChatMessage
							navigateTo="/odie"
							onClick={ () => handleClick( interaction ) }
							key={ interaction.uuid }
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

	const [ interactionConversationPairs, setInteractionConversationPairs ] = useState<
		[ SupportInteraction, ZendeskConversation ][]
	>( [] );
	const [ selectedTab, setSelectedTab ] = useState( TAB_STATES.recent );
	const { getConversations } = useSmooch();
	const { data: supportInteractions } = useGetSupportInteractions( 'zendesk', 100, 'resolved' );

	const { isChatLoaded, unreadCount } = useSelect( ( select ) => {
		const store = select( HELP_CENTER_STORE ) as HelpCenterSelect;
		return {
			isChatLoaded: store.getIsChatLoaded(),
			unreadCount: store.getUnreadCount(),
		};
	}, [] );

	const { recentConversations, archivedConversations } = getFilteredConversations( {
		interactionConversationPairs,
	} );
	const { setUnreadCount } = useDataStoreDispatch( HELP_CENTER_STORE );

	useEffect( () => {
		if ( isChatLoaded && supportInteractions && supportInteractions?.length > 0 ) {
			const conversations = getConversations();

			const interactionConversationPairs = supportInteractions.reduce<
				[ SupportInteraction, ZendeskConversation ][]
			>( ( pairs, interaction ) => {
				const matchingConversation = conversations.find(
					( conversation ) => conversation.metadata?.supportInteractionId === interaction.uuid
				);
				if ( matchingConversation ) {
					pairs.push( [ interaction, matchingConversation ] );
				}
				return pairs;
			}, [] );

			setInteractionConversationPairs( interactionConversationPairs );
		}
	}, [ supportInteractions, isChatLoaded, getConversations, setUnreadCount ] );

	const EmptyArchivedConversations = () => {
		return (
			<Card isBorderless size="small" className="help-center-chat-history__archive-no-results">
				<CardHeader className="help-center-chat-history__archive-no-results-header">
					<h4>{ __( 'Your Archive is Empty', __i18n_text_domain__ ) }</h4>
				</CardHeader>
				<CardBody className="help-center-chat-history__archive-no-results-body">
					{ __(
						'Resolved issues and past conversations will be available here',
						__i18n_text_domain__
					) }
					<Link
						to="/odie"
						onClick={ () => {} }
						className="help-center-chat-history__archive-no-results-button"
					>
						<Icon icon={ comment } />
						{ __( 'Get support', __i18n_text_domain__ ) }
					</Link>
				</CardBody>
			</Card>
		);
	};

	// Temporarily simplified version
	if ( simplifiedHistoryChat ) {
		return <Conversations conversations={ interactionConversationPairs } />;
	}

	return (
		<div className="help-center-chat-history">
			<SectionNav>
				<NavTabs>
					<NavItem
						selected={ selectedTab === TAB_STATES.recent }
						onClick={ () => setSelectedTab( TAB_STATES.recent ) }
						count={ unreadCount > 0 ? unreadCount : undefined }
					>
						{ __( 'Recent', __i18n_text_domain__ ) }
					</NavItem>
					<NavItem
						selected={ selectedTab === TAB_STATES.archived }
						onClick={ () => setSelectedTab( TAB_STATES.archived ) }
					>
						{ __( 'Archived', __i18n_text_domain__ ) }
					</NavItem>
				</NavTabs>
			</SectionNav>

			{ selectedTab === TAB_STATES.recent && (
				<Conversations conversations={ recentConversations } />
			) }

			{ selectedTab === TAB_STATES.archived &&
				( archivedConversations?.length > 0 ? (
					<Conversations conversations={ archivedConversations } />
				) : (
					<EmptyArchivedConversations />
				) ) }
		</div>
	);
};
