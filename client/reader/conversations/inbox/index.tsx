import { type NotificationNote } from '@automattic/api-core';
import page from '@automattic/calypso-router';
import { useBreakpoint } from '@automattic/viewport-react';
import { __experimentalHStack as HStack } from '@wordpress/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useRef, useState } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import ReaderMain from 'calypso/reader/components/reader-main';
import {
	getConversationKey,
	useConversations,
	useMarkConversationsRead,
	useOwnComments,
	type Conversation,
} from 'calypso/reader/data/conversations';
import { useCommentNotes } from 'calypso/reader/data/notifications';
import { useSelectedPostCommands } from 'calypso/reader/stream/use-selected-post-commands';
import { useDispatch, useSelector } from 'calypso/state';
import { savePreference } from 'calypso/state/preferences/actions';
import { getPreference } from 'calypso/state/preferences/selectors';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import isNotificationsOpen from 'calypso/state/selectors/is-notifications-open';
import { toggleNotificationsPanel } from 'calypso/state/ui/actions';
import { ConversationDetail } from './conversation-detail';
import { ConversationList } from './conversation-list';
import { type InboxItem, type OpenSource } from './conversation-list/list-item';
import { INBOX_TABS, type InboxTab } from './conversation-list/tabs';
import { type Density, type SortOrder } from './conversation-list/toolbar';
import { useInboxKeyboardShortcuts } from './keyboard-shortcuts/use-inbox-keyboard-shortcuts';

import './style.scss';

const DENSITY_PREFERENCE = 'reader_conversations_inbox_density';

interface Props {
	siteId?: string;
	postId?: string;
}

const REFRESH_INTERVAL = 60 * 1000;
const SEARCH_DEBOUNCE = 300;
// The routes reject longer search terms.
const MAX_SEARCH_LENGTH = 100;
// The Reader sidebar (~272px) and the 372px list leave the detail pane about 540px at this width.
// It has to be one @automattic/viewport defines, or useBreakpoint never matches.
const SINGLE_PANE_BREAKPOINT = '<1180px';

type Unread = Pick< Conversation, 'unreadNoteIds' | 'unreadCommentIds' >;

// Your comments can open a post the All pages haven't loaded yet, so its unread notes come from the notes.
const getUnreadFromNotes = (
	notes: NotificationNote[] | undefined,
	{ siteId, postId }: Pick< Conversation, 'siteId' | 'postId' >
): Unread | undefined => {
	const unread = notes?.filter(
		( { read, meta } ) => ! read && meta?.ids?.site === siteId && meta?.ids?.post === postId
	);
	return (
		unread && {
			unreadNoteIds: unread.map( ( { id } ) => id ),
			unreadCommentIds: unread.flatMap( ( { meta } ) => meta?.ids?.comment ?? [] ),
		}
	);
};

const union = ( ...lists: ( number[] | undefined )[] ) => [
	...new Set( lists.flatMap( ( list ) => list ?? [] ) ),
];

const getConversationPath = ( { siteId, postId }: Pick< Conversation, 'siteId' | 'postId' > ) =>
	`/reader/conversations/inbox/${ siteId }/${ postId }`;

interface Opened {
	key: string;
	// Marking a conversation read clears its unread notes, so keep the ones it had when it was opened.
	// Unset while the notes a post outside the loaded pages needs are still loading.
	unread?: Unread;
	// Set when opened from Your comments, which starts the thread at that comment.
	anchor?: { commentId: number };
	// Keeps the header and highlights when a search filters the conversation out of the list.
	conversation?: Conversation;
}

export function ConversationsInbox( { siteId, postId }: Props ) {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const [ tab, setTab ] = useState< InboxTab >( 'all' );
	const [ search, setSearch ] = useState( '' );
	const [ sort, setSort ] = useState< SortOrder >( 'newest' );
	const searchTerm = search.trim().slice( 0, MAX_SEARCH_LENGTH );
	const [ debouncedSearch, setDebouncedSearch ] = useState( searchTerm );
	// use-debounce 3 never fires again after React's StrictMode remounts the effect.
	useEffect( () => {
		const timer = setTimeout( () => setDebouncedSearch( searchTerm ), SEARCH_DEBOUNCE );
		return () => clearTimeout( timer );
	}, [ searchTerm ] );
	const conversationsQuery = useConversations( {
		sort,
		// The other tabs only read it to look up the open conversation, which a search could hide.
		search: tab === 'all' ? debouncedSearch : '',
		refetchInterval: REFRESH_INTERVAL,
		// Its cached pages still serve those lookups while Unread runs its own query.
		enabled: tab !== 'unread',
	} );
	const unreadQuery = useConversations( {
		sort,
		search: debouncedSearch,
		scope: 'unread',
		refetchInterval: REFRESH_INTERVAL,
		enabled: tab === 'unread',
	} );
	const ownCommentsQuery = useOwnComments( {
		sort,
		search: debouncedSearch,
		enabled: tab === 'yours',
	} );
	const conversationsShownQuery = tab === 'unread' ? unreadQuery : conversationsQuery;
	const { conversations } = conversationsShownQuery;
	// Every scope returns the same total, so All's keeps the count up while Unread loads.
	const { unreadTotal } = unreadQuery.data && tab === 'unread' ? unreadQuery : conversationsQuery;
	const listQuery = tab === 'yours' ? ownCommentsQuery : conversationsShownQuery;
	// Your comments, and a conversation Unread no longer lists, are looked up in All.
	const findConversation = ( key?: string ) =>
		conversations.find( ( candidate ) => candidate.key === key ) ??
		conversationsQuery.conversations.find( ( candidate ) => candidate.key === key );
	const { fetchNextPage } = listQuery;
	const loadMore = useCallback( () => fetchNextPage(), [ fetchNextPage ] );
	const { mutate: markRead } = useMarkConversationsRead();
	const notificationsOpen = useSelector( isNotificationsOpen );
	const isNarrow = useBreakpoint( SINGLE_PANE_BREAKPOINT );
	const [ isShortcutsOpen, setIsShortcutsOpen ] = useState( false );
	const inboxRef = useRef< HTMLDivElement >( null );
	const wasShowingDetailRef = useRef( false );
	const density: Density = useSelector(
		( state ) => getPreference( state, DENSITY_PREFERENCE ) ?? 'comfortable'
	);

	const visible: InboxItem[] = tab === 'yours' ? ownCommentsQuery.comments : conversations;
	const selectedKey = siteId && postId ? getConversationKey( siteId, postId ) : undefined;
	const [ opened, setOpened ] = useState< Opened >();
	const activeOpened = opened?.key === selectedKey ? opened : undefined;
	const selectedIndex = visible.findIndex( ( { key } ) => key === selectedKey );
	const found = findConversation( selectedKey );
	const selected = found ?? activeOpened?.conversation;
	const [ previousKey, setPreviousKey ] = useState( selectedKey );
	if ( selectedKey !== previousKey ) {
		setPreviousKey( selectedKey );
		if ( opened && opened.key !== selectedKey ) {
			setOpened( undefined );
		}
	}
	// Merged on each render, so comments that come in while it's open still get highlighted.
	const newCommentIds = union( activeOpened?.unread?.unreadCommentIds, selected?.unreadCommentIds );
	// A post opened before the notes loaded gets its unread notes, and is marked read, once they do.
	const isWaitingForNotes = !! activeOpened && ! activeOpened.unread;
	// Only posts outside the loaded pages need the notes, and only Your comments opens those.
	const { data: notes } = useCommentNotes( {
		enabled: tab === 'yours' || isWaitingForNotes,
		refetchInterval: REFRESH_INTERVAL,
	} );

	useEffect( () => {
		dispatch( recordReaderTracksEvent( 'calypso_reader_conversations_inbox_viewed' ) );
	}, [ dispatch ] );

	useEffect( () => {
		if ( ! isNarrow && ! selectedKey && conversations.length ) {
			page.replace( getConversationPath( conversations[ 0 ] ) );
		}
	}, [ isNarrow, selectedKey, conversations ] );

	useEffect( () => {
		if ( ! isWaitingForNotes ) {
			return;
		}
		const unread = getUnreadFromNotes( notes, {
			siteId: Number( siteId ),
			postId: Number( postId ),
		} );
		if ( ! unread ) {
			return;
		}
		setOpened( ( current ) => current && { ...current, unread } );
		if ( unread.unreadNoteIds.length ) {
			markRead( unread.unreadNoteIds );
		}
	}, [ isWaitingForNotes, notes, siteId, postId, markRead ] );

	const open = useCallback(
		( next: Opened, noteIds = next.unread?.unreadNoteIds ) => {
			setOpened( next );
			if ( noteIds?.length ) {
				markRead( noteIds );
			}
		},
		[ markRead ]
	);

	// A conversation opened from the URL, or as the first one, is read like one picked from the list.
	useEffect( () => {
		// A conversation opened from the list sets `opened` before the URL catches up.
		if ( ! selectedKey || opened || ( ! found && conversationsShownQuery.isLoading ) ) {
			return;
		}
		open( { key: selectedKey, unread: found, conversation: found } );
	}, [ selectedKey, opened, found, conversationsShownQuery.isLoading, open ] );

	const openConversation = ( item: InboxItem, source: OpenSource ) => {
		const key = getConversationKey( item.siteId, item.postId );
		const conversation = findConversation( key );
		const unread: Unread | undefined = conversation ?? getUnreadFromNotes( notes, item );
		const unreadNoteIds = unread?.unreadNoteIds;
		const previous = key === opened?.key ? opened.unread : undefined;
		open(
			{
				key,
				// Opening it again adds any notes that came in since, such as past the route's 50 ids.
				unread: previous
					? {
							unreadNoteIds: union( previous.unreadNoteIds, unread?.unreadNoteIds ),
							unreadCommentIds: union( previous.unreadCommentIds, unread?.unreadCommentIds ),
						}
					: unread,
				anchor: 'commentId' in item ? { commentId: item.commentId } : undefined,
				conversation,
			},
			unreadNoteIds
		);
		if ( key === selectedKey ) {
			return;
		}
		dispatch(
			recordReaderTracksEvent( 'calypso_reader_conversations_inbox_conversation_opened', {
				source,
				unread_count: conversation?.unreadCount ?? unreadNoteIds?.length ?? 0,
			} )
		);
		page.show( getConversationPath( item ) );
	};

	const markable = conversations.filter( ( { unreadNoteIds } ) => unreadNoteIds.length );
	const markAllRead = () => {
		markRead( markable.flatMap( ( { unreadNoteIds } ) => unreadNoteIds ) );
		dispatch(
			recordReaderTracksEvent( 'calypso_reader_conversations_inbox_marked_all_read', {
				count: markable.length,
			} )
		);
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

	const changeDensity = ( next: Density ) => {
		if ( next === density ) {
			return;
		}
		dispatch( savePreference( DENSITY_PREFERENCE, next ) );
		dispatch(
			recordReaderTracksEvent( 'calypso_reader_conversations_inbox_density_changed', {
				density: next,
			} )
		);
	};

	const moveTab = ( offset: number ) => {
		const next = INBOX_TABS[ INBOX_TABS.indexOf( tab ) + offset ];
		if ( next ) {
			selectTab( next, 'shortcut' );
		}
	};

	const { toggleSelectedLike } = useSelectedPostCommands(
		siteId && postId ? { blogId: Number( siteId ), postId: Number( postId ) } : null
	);

	useInboxKeyboardShortcuts( {
		enabled: ! notificationsOpen,
		onNext: () => goTo( nextIndex, 'shortcut' )?.(),
		onPrevious: () => goTo( previousIndex, 'shortcut' )?.(),
		onNextTab: () => moveTab( 1 ),
		onPreviousTab: () => moveTab( -1 ),
		onSelectTab: ( next ) => selectTab( next, 'shortcut' ),
		onToggleShortcuts: () => setIsShortcutsOpen( ( isOpen ) => ! isOpen ),
		onToggleLike: toggleSelectedLike,
		onOpenNotifications: () => dispatch( toggleNotificationsPanel() ),
	} );

	const hasConversation = Boolean( siteId && postId );
	const isShowingDetail = isNarrow && hasConversation;

	useEffect( () => {
		// The back button unmounts with the detail, which would drop focus to the body.
		if ( wasShowingDetailRef.current && isNarrow && ! hasConversation ) {
			inboxRef.current
				?.querySelector< HTMLElement >( '[role="tab"][aria-selected="true"]' )
				?.focus();
		}
		wasShowingDetailRef.current = isNarrow && hasConversation;
	}, [ isNarrow, hasConversation ] );

	return (
		<ReaderMain className="conversations-inbox-main no-padding" wideLayout>
			<DocumentHead title={ translate( 'Conversations' ) } />
			<HStack
				ref={ inboxRef }
				spacing={ 0 }
				alignment="stretch"
				className={ clsx( 'conversations-inbox', {
					'is-narrow': isNarrow,
					'is-showing-detail': isShowingDetail,
				} ) }
			>
				<ConversationList
					items={ visible }
					unreadCount={ unreadTotal }
					isLoading={ listQuery.isLoading }
					isError={ listQuery.isError && ! listQuery.data?.pages.length }
					onRetry={ () => listQuery.refetch() }
					hasMore={ listQuery.hasNextPage && ! listQuery.isPlaceholderData }
					isLoadingMore={ listQuery.isFetchingNextPage }
					isLoadMoreError={ listQuery.isFetchNextPageError }
					onLoadMore={ loadMore }
					tab={ tab }
					onTabChange={ ( next ) => selectTab( next, 'click' ) }
					search={ search }
					onSearchChange={ setSearch }
					density={ density }
					onDensityChange={ changeDensity }
					sort={ sort }
					onSortChange={ selectSort }
					markAllCount={ markable.length }
					onMarkAllRead={ markAllRead }
					isShortcutsOpen={ isShortcutsOpen }
					onShortcutsToggle={ setIsShortcutsOpen }
					selectedKey={ selectedKey }
					openOnFocus={ ! isNarrow }
					onSelect={ openConversation }
				/>
				{ hasConversation && (
					<ConversationDetail
						siteId={ Number( siteId ) }
						postId={ Number( postId ) }
						conversation={ selected }
						startingCommentId={ activeOpened?.anchor?.commentId }
						highlightedCommentIds={ newCommentIds }
						onBack={ isNarrow ? () => page.show( '/reader/conversations/inbox' ) : undefined }
						onPrevious={ goTo( previousIndex, 'button' ) }
						onNext={ goTo( nextIndex, 'button' ) }
					/>
				) }
			</HStack>
		</ReaderMain>
	);
}
