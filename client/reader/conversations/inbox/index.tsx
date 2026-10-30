import page from '@automattic/calypso-router';
import { useBreakpoint } from '@automattic/viewport-react';
import { __experimentalHStack as HStack } from '@wordpress/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useMemo, useRef, useState } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import ReaderMain from 'calypso/reader/components/reader-main';
import { useCommentNotes, useMarkNotesRead } from 'calypso/reader/data/notifications';
import { useDispatch, useSelector } from 'calypso/state';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import { errorNotice } from 'calypso/state/notices/actions';
import { savePreference } from 'calypso/state/preferences/actions';
import { getPreference } from 'calypso/state/preferences/selectors';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import isNotificationsOpen from 'calypso/state/selectors/is-notifications-open';
import { ConversationDetail } from './conversation-detail';
import { ConversationList } from './conversation-list';
import { filterConversations } from './conversation-list/filter-conversations';
import { type OpenSource } from './conversation-list/list-item';
import { INBOX_TABS, type InboxTab } from './conversation-list/tabs';
import { type Density, type SortOrder } from './conversation-list/toolbar';
import { getConversationKey, groupNotesByPost, type Conversation } from './group-notes';
import { useInboxKeyboardShortcuts } from './keyboard-shortcuts/use-inbox-keyboard-shortcuts';

import './style.scss';

const DENSITY_PREFERENCE = 'reader_conversations_inbox_density';

interface Props {
	siteId?: string;
	postId?: string;
}

const getConversationPath = ( { siteId, postId }: Pick< Conversation, 'siteId' | 'postId' > ) =>
	`/reader/conversations/inbox/${ siteId }/${ postId }`;

export function ConversationsInbox( { siteId, postId }: Props ) {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const { data: notes = [], isLoading, isError, refetch } = useCommentNotes();
	const { mutate: markRead } = useMarkNotesRead();
	const notificationsOpen = useSelector( isNotificationsOpen );
	const isNarrow = useBreakpoint( '<782px' );
	const currentUserId = useSelector( getCurrentUserId );
	const [ tab, setTab ] = useState< InboxTab >( 'all' );
	const [ search, setSearch ] = useState( '' );
	const [ sort, setSort ] = useState< SortOrder >( 'newest_replies' );
	const [ isShortcutsOpen, setIsShortcutsOpen ] = useState( false );
	const inboxRef = useRef< HTMLDivElement >( null );
	const wasShowingDetailRef = useRef( false );
	const density: Density = useSelector(
		( state ) => getPreference( state, DENSITY_PREFERENCE ) ?? 'comfortable'
	);

	const conversations = useMemo(
		() => groupNotesByPost( notes, currentUserId ),
		[ notes, currentUserId ]
	);
	const visible = useMemo( () => {
		const filtered = filterConversations( conversations, tab, search );
		// The sort is stable, so ties keep the newest-first order.
		return sort === 'most_active'
			? [ ...filtered ].sort( ( a, b ) => b.noteIds.length - a.noteIds.length )
			: filtered;
	}, [ conversations, tab, search, sort ] );
	const unreadCount = conversations.reduce(
		( total, { unreadNoteIds } ) => total + unreadNoteIds.length,
		0
	);
	const selectedKey = siteId && postId ? getConversationKey( siteId, postId ) : undefined;
	const selectedIndex = visible.findIndex( ( { key } ) => key === selectedKey );
	const selected = conversations.find( ( { key } ) => key === selectedKey );

	// Marking a conversation read clears its unread comments, so keep the ones it had when it was opened.
	const [ opened, setOpened ] = useState< { key: string; commentIds: number[] } >();
	const [ previousKey, setPreviousKey ] = useState( selectedKey );
	if ( selectedKey !== previousKey ) {
		setPreviousKey( selectedKey );
		if ( opened && opened.key !== selectedKey ) {
			setOpened( undefined );
		}
	}
	const newCommentIds =
		opened && opened.key === selectedKey ? opened.commentIds : selected?.unreadCommentIds;

	useEffect( () => {
		dispatch( recordReaderTracksEvent( 'calypso_reader_conversations_inbox_viewed' ) );
	}, [ dispatch ] );

	useEffect( () => {
		if ( ! isNarrow && ! selectedKey && conversations.length ) {
			page.replace( getConversationPath( conversations[ 0 ] ) );
		}
	}, [ isNarrow, selectedKey, conversations ] );

	const openConversation = ( conversation: Conversation, source: OpenSource ) => {
		const unreadCount = conversation.unreadNoteIds.length;
		if ( conversation.key !== opened?.key ) {
			setOpened( { key: conversation.key, commentIds: conversation.unreadCommentIds } );
		}
		if ( unreadCount ) {
			markRead( conversation.unreadNoteIds, {
				onError: () => dispatch( errorNotice( translate( 'Couldn’t mark as read. Try again.' ) ) ),
			} );
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

	const markAllRead = () => {
		markRead( conversations.flatMap( ( { unreadNoteIds } ) => unreadNoteIds ) );
		dispatch(
			recordReaderTracksEvent( 'calypso_reader_conversations_inbox_marked_all_read', {
				count: unreadCount,
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

	useInboxKeyboardShortcuts( {
		enabled: ! notificationsOpen,
		onNext: () => goTo( nextIndex, 'shortcut' )?.(),
		onPrevious: () => goTo( previousIndex, 'shortcut' )?.(),
		onNextTab: () => moveTab( 1 ),
		onPreviousTab: () => moveTab( -1 ),
		onSelectTab: ( next ) => selectTab( next, 'shortcut' ),
		onToggleShortcuts: () => setIsShortcutsOpen( ( isOpen ) => ! isOpen ),
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
					conversations={ visible }
					unreadCount={ unreadCount }
					isLoading={ isLoading }
					isError={ isError && ! notes.length }
					onRetry={ () => refetch() }
					tab={ tab }
					onTabChange={ ( next ) => selectTab( next, 'click' ) }
					search={ search }
					onSearchChange={ setSearch }
					density={ density }
					onDensityChange={ changeDensity }
					sort={ sort }
					onSortChange={ selectSort }
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
