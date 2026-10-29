import page from '@automattic/calypso-router';
import { __experimentalHStack as HStack } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useMemo, useState } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import ReaderMain from 'calypso/reader/components/reader-main';
import { useCommentNotes, useMarkNotesRead } from 'calypso/reader/data/notifications';
import { useDispatch, useSelector } from 'calypso/state';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import isNotificationsOpen from 'calypso/state/selectors/is-notifications-open';
import { ConversationDetail } from './conversation-detail';
import { ConversationList } from './conversation-list';
import { filterConversations } from './conversation-list/filter-conversations';
import { type OpenSource } from './conversation-list/list-item';
import {
	DEFAULT_SORT_ORDER,
	sortConversations,
	type SortOrder,
} from './conversation-list/sort-conversations';
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
	const dispatch = useDispatch();
	const { data: notes = [], isLoading } = useCommentNotes();
	const { mutate: markRead } = useMarkNotesRead();
	const notificationsOpen = useSelector( isNotificationsOpen );
	const [ tab, setTab ] = useState< InboxTab >( 'all' );
	const [ search, setSearch ] = useState( '' );
	const [ sort, setSort ] = useState< SortOrder >( DEFAULT_SORT_ORDER );
	const [ isShortcutsOpen, setIsShortcutsOpen ] = useState( false );

	const conversations = useMemo( () => groupNotesByPost( notes ), [ notes ] );
	const visible = useMemo(
		() => sortConversations( filterConversations( conversations, tab, search ), sort ),
		[ conversations, tab, search, sort ]
	);
	const unreadCount = conversations.reduce(
		( total, { unreadNoteIds } ) => total + unreadNoteIds.length,
		0
	);
	const selectedKey = siteId && postId ? getConversationKey( siteId, postId ) : undefined;
	const selectedIndex = visible.findIndex( ( { key } ) => key === selectedKey );
	const selected = conversations.find( ( { key } ) => key === selectedKey );

	useEffect( () => {
		dispatch( recordReaderTracksEvent( 'calypso_reader_conversations_inbox_viewed' ) );
	}, [ dispatch ] );

	useEffect( () => {
		if ( ! selectedKey && conversations.length ) {
			page.replace( getConversationPath( conversations[ 0 ] ) );
		}
	}, [ selectedKey, conversations ] );

	const openConversation = ( conversation: Conversation, source: OpenSource ) => {
		const unreadCount = conversation.unreadNoteIds.length;
		if ( unreadCount ) {
			markRead( conversation.unreadNoteIds );
		}
		if ( conversation.key === selectedKey ) {
			return;
		}
		dispatch(
			recordReaderTracksEvent( 'calypso_reader_conversations_inbox_conversation_opened', {
				source,
				unread_count: unreadCount,
			} )
		);
		page.show( getConversationPath( conversation ) );
	};

	const goTo = ( index: number, source: OpenSource ) => {
		const target = visible[ index ];
		return target ? () => openConversation( target, source ) : undefined;
	};

	const previousIndex = selectedIndex > 0 ? selectedIndex - 1 : -1;
	// With the open conversation filtered out of the list, next starts from the top.
	const nextIndex = selectedIndex + 1;

	const selectTab = ( next: InboxTab, source: 'click' | 'shortcut' ) => {
		if ( next === tab ) {
			return;
		}
		setTab( next );
		dispatch(
			recordReaderTracksEvent( 'calypso_reader_conversations_inbox_tab_selected', {
				tab: next,
				source,
			} )
		);
	};

	const selectSort = ( next: SortOrder ) => {
		setSort( next );
		dispatch(
			recordReaderTracksEvent( 'calypso_reader_conversations_inbox_sorted', { sort: next } )
		);
	};

	const moveTab = ( offset: number ) => {
		const next = INBOX_TABS[ INBOX_TABS.indexOf( tab ) + offset ];
		if ( next ) {
			selectTab( next, 'shortcut' );
		}
	};

	useInboxKeyboardShortcuts( {
		enabled: ! notificationsOpen,
		onNext: () => goTo( nextIndex, 'shortcut' )?.(),
		onPrevious: () => goTo( previousIndex, 'shortcut' )?.(),
		onNextTab: () => moveTab( 1 ),
		onPreviousTab: () => moveTab( -1 ),
		onSelectTab: ( next ) => selectTab( next, 'shortcut' ),
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
					onTabChange={ ( next ) => selectTab( next, 'click' ) }
					search={ search }
					onSearchChange={ setSearch }
					sort={ sort }
					onSortChange={ selectSort }
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
						onPrevious={ goTo( previousIndex, 'button' ) }
						onNext={ goTo( nextIndex, 'button' ) }
					/>
				) }
			</HStack>
		</ReaderMain>
	);
}
