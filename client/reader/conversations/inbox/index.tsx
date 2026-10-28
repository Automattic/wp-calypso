import page from '@automattic/calypso-router';
import { __experimentalHStack as HStack } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import ReaderMain from 'calypso/reader/components/reader-main';
import { useCommentNotes, useMarkNotesRead } from 'calypso/reader/data/notifications';
import isNotificationsOpen from 'calypso/state/selectors/is-notifications-open';
import { ConversationDetail } from './conversation-detail';
import { ConversationList } from './conversation-list';
import { filterConversations } from './conversation-list/filter-conversations';
import { INBOX_TABS, type InboxTab } from './conversation-list/tabs';
import { getConversationKey, groupNotesByPost, type Conversation } from './group-notes';
import { useInboxKeyboardShortcuts } from './keyboard-shortcuts/use-inbox-keyboard-shortcuts';

import './style.scss';

interface Props {
	siteId?: string;
	postId?: string;
}

const getConversationPath = ( { siteId, postId }: Pick< Conversation, 'siteId' | 'postId' > ) =>
	`/reader/conversations/inbox/${ siteId }/${ postId }`;

export function ConversationsInbox( { siteId, postId }: Props ) {
	const translate = useTranslate();
	const { data: notes = [], isLoading } = useCommentNotes();
	const { mutate: markRead } = useMarkNotesRead();
	const notificationsOpen = useSelector( isNotificationsOpen );
	const [ tab, setTab ] = useState< InboxTab >( 'all' );
	const [ search, setSearch ] = useState( '' );
	const [ isShortcutsOpen, setIsShortcutsOpen ] = useState( false );

	const conversations = useMemo( () => groupNotesByPost( notes ), [ notes ] );
	const visible = useMemo(
		() => filterConversations( conversations, tab, search ),
		[ conversations, tab, search ]
	);
	const unreadCount = conversations.reduce(
		( total, { unreadNoteIds } ) => total + unreadNoteIds.length,
		0
	);
	const selectedKey = siteId && postId ? getConversationKey( siteId, postId ) : undefined;
	const selectedIndex = visible.findIndex( ( { key } ) => key === selectedKey );
	const selected = conversations.find( ( { key } ) => key === selectedKey );

	useEffect( () => {
		if ( ! selectedKey && conversations.length ) {
			page.replace( getConversationPath( conversations[ 0 ] ) );
		}
	}, [ selectedKey, conversations ] );

	const openConversation = ( conversation: Conversation ) => {
		if ( conversation.unreadNoteIds.length ) {
			markRead( conversation.unreadNoteIds );
		}
		page.show( getConversationPath( conversation ) );
	};

	const goTo = ( index: number ) => {
		const target = visible[ index ];
		return target ? () => openConversation( target ) : undefined;
	};

	const onPrevious = selectedIndex > 0 ? goTo( selectedIndex - 1 ) : undefined;
	// With the open conversation filtered out of the list, next starts from the top.
	const onNext = goTo( selectedIndex + 1 );

	const moveTab = ( offset: number ) => {
		const next = INBOX_TABS[ INBOX_TABS.indexOf( tab ) + offset ];
		if ( next ) {
			setTab( next );
		}
	};

	useInboxKeyboardShortcuts( {
		enabled: ! notificationsOpen,
		onNext: () => onNext?.(),
		onPrevious: () => onPrevious?.(),
		onNextTab: () => moveTab( 1 ),
		onPreviousTab: () => moveTab( -1 ),
		onSelectTab: setTab,
		onToggleShortcuts: () => setIsShortcutsOpen( ( isOpen ) => ! isOpen ),
	} );

	return (
		<ReaderMain className="conversations-inbox-main no-padding" wideLayout>
			<DocumentHead title={ translate( 'Conversations' ) } />
			<HStack spacing={ 0 } alignment="stretch" className="conversations-inbox">
				<ConversationList
					conversations={ visible }
					unreadCount={ unreadCount }
					isLoading={ isLoading }
					tab={ tab }
					onTabChange={ setTab }
					search={ search }
					onSearchChange={ setSearch }
					isShortcutsOpen={ isShortcutsOpen }
					onShortcutsToggle={ setIsShortcutsOpen }
					selectedKey={ selectedKey }
					onSelect={ openConversation }
				/>
				{ siteId && postId && (
					<ConversationDetail
						siteId={ Number( siteId ) }
						postId={ Number( postId ) }
						conversation={ selected }
						onPrevious={ onPrevious }
						onNext={ onNext }
					/>
				) }
			</HStack>
		</ReaderMain>
	);
}
