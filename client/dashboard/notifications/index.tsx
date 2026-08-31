import { useNavigate } from '@tanstack/react-router';
import {
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
	Spinner,
} from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { filterSortAndPaginate } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAnalytics } from '../app/analytics';
import { DataViews, DataViewsCard } from '../components/dataviews';
import { PageHeader } from '../components/page-header';
import PageLayout from '../components/page-layout';
import {
	NotesProvider,
	acquireEngineVisibility,
	getListEndReason,
	hasMoreNotesFor,
	loadMoreFor,
	setActiveTab,
	useVisibleNotes,
} from './engine';
import { getFields } from './fields';
import NoteDetail from './note-detail';
import type { FilterName, Note } from './engine';
import type { View } from '@wordpress/dataviews';

import './style.scss';

// DataViews only loads more in response to scroll events, so the rendered
// window (`perPage` rows) must be tall enough to overflow the pane and produce
// a scrollbar. The REST client may fetch smaller network pages; the effect
// below loads as many as needed to fill this window.
const NOTES_PER_PAGE = 20;

export type InboxCategory = 'all' | 'unread' | 'comments' | 'subscribers' | 'likes';

// The left sidebar's category URLs mapped to the engine's server filters.
const CATEGORY_TO_TAB: Record< InboxCategory, FilterName > = {
	all: 'all',
	unread: 'unread',
	comments: 'comments',
	subscribers: 'follows',
	likes: 'likes',
};

const EMPTY_MESSAGES: Record< InboxCategory, string > = {
	all: __( 'No notifications yet.' ),
	unread: __( 'You’re all caught up.' ),
	comments: __( 'No comment notifications.' ),
	subscribers: __( 'No subscriber notifications.' ),
	likes: __( 'No like notifications.' ),
};

function InboxList( {
	category,
	selectedNoteId,
	onSelectNote,
	onFirstNoteLoaded,
}: {
	category: InboxCategory;
	selectedNoteId: string | undefined;
	onSelectNote: ( noteId: string | undefined ) => void;
	onFirstNoteLoaded: ( noteId: string ) => void;
} ) {
	const tab = CATEGORY_TO_TAB[ category ];
	const { notes, isLoading, hasInitiallyLoaded } = useVisibleNotes( tab );

	// DataViews binds its infinite-scroll listener once, on mount, and only
	// after it first renders as not-loading. Mount it only once this tab's
	// first load has settled, and pass it isLoading={false} from then on.
	const hasInitiallyLoadedRef = useRef( false );
	if ( hasInitiallyLoaded ) {
		hasInitiallyLoadedRef.current = true;
	}

	const [ initialView, setView ] = useState< View >( {
		type: 'list',
		titleField: 'title',
		descriptionField: 'description',
		mediaField: 'icon',
		fields: [],
		page: 1,
		infiniteScrollEnabled: true,
		startPosition: 1,
		// Group notes into time sections ("Today", "Yesterday", …). `direction`
		// is required by the type but inert, since `timeGroup` opts out of sorting.
		groupBy: { field: 'timeGroup', direction: 'asc', showLabel: false },
	} );

	useEffect( () => {
		if ( hasInitiallyLoaded && notes.length > 0 ) {
			onFirstNoteLoaded( notes[ 0 ].id.toString() );
		}
	}, [ hasInitiallyLoaded, notes, onFirstNoteLoaded ] );

	const view = { ...initialView, perPage: NOTES_PER_PAGE };
	const startPosition = view.startPosition ?? 1;

	// Field identities must stay stable or DataViews remounts every cell per re-render.
	const fields = useMemo( () => getFields(), [] );

	// The engine's server filter is driven by the sidebar categories, never by
	// DataViews view state; this just paginates the loaded notes into the window.
	const { data, paginationInfo } = filterSortAndPaginate( notes, view, fields );

	// `filterSortAndPaginate` reports `totalItems` as the count of notes loaded
	// so far, but DataViews advances its infinite-scroll window only while
	// `totalItems` stays ahead of the window. Report an optimistic total while
	// the engine still has notes left so DataViews keeps driving load-more.
	const hasMore = hasMoreNotesFor( tab );
	const effectivePaginationInfo = hasMore
		? { ...paginationInfo, totalItems: paginationInfo.totalItems + NOTES_PER_PAGE }
		: paginationInfo;

	// End-of-list note once scrolling truly stops.
	const endReason = ! hasMore && data.length > 0 ? getListEndReason( tab ) : null;

	const infiniteScrollHandler = useCallback( () => {
		if ( ! isLoading ) {
			loadMoreFor( tab );
		}
	}, [ tab, isLoading ] );

	// Fetch pages until the window is filled (a network page can be smaller), so
	// a short list still overflows the pane and gets a scrollbar to drive more.
	useEffect( () => {
		if ( startPosition + NOTES_PER_PAGE > notes.length && ! isLoading && hasMore ) {
			infiniteScrollHandler();
		}
	}, [ startPosition, notes, isLoading, hasMore, infiniteScrollHandler ] );

	if ( ! hasInitiallyLoadedRef.current ) {
		return (
			<VStack alignment="center" style={ { padding: '40px 0' } }>
				<Spinner />
			</VStack>
		);
	}

	// Spinner instead of an empty message while the view may still be filling.
	const showEmptyLoader = hasMore || isLoading;

	return (
		<DataViews< Note >
			data={ data }
			fields={ fields }
			view={ view }
			// Loading UI is driven here (full spinner before mount, the `empty`
			// slot and the foot spinner after); DataViews must not hide the
			// cached rows it just mounted with.
			isLoading={ false }
			defaultLayouts={ { list: {}, table: {} } }
			paginationInfo={ effectivePaginationInfo }
			empty={
				showEmptyLoader ? (
					<VStack alignment="center" style={ { padding: '40px 0' } }>
						<Spinner />
					</VStack>
				) : (
					<VStack alignment="center" style={ { padding: '40px 0' } }>
						<Text size={ 15 } weight={ 500 }>
							{ EMPTY_MESSAGES[ category ] }
						</Text>
					</VStack>
				)
			}
			getItemId={ ( item ) => item.id.toString() }
			selection={ selectedNoteId ? [ selectedNoteId ] : [] }
			onChangeView={ setView }
			onChangeSelection={ ( selection ) => onSelectNote( selection[ 0 ] ) }
		>
			<HStack
				justify="flex-end"
				alignment="top"
				spacing={ 2 }
				className="dashboard-notifications-inbox__list-toolbar dataviews__view-actions"
			>
				<DataViews.ViewConfig />
			</HStack>
			<DataViews.Layout />
			{ hasMore && data.length > 0 && isLoading && (
				// DataViews suppresses its own load-more spinner when notes are
				// grouped, so this stands in for it, below the list rows.
				<VStack alignment="center" style={ { flexShrink: 0, padding: '12px 0' } }>
					<Spinner />
				</VStack>
			) }
			{ endReason && (
				<VStack alignment="center" style={ { flexShrink: 0, padding: '12px 0' } }>
					<Text variant="muted">
						{ endReason === 'cap'
							? __( 'Showing your most recent notifications.' )
							: __( 'You’re all caught up.' ) }
					</Text>
				</VStack>
			) }
		</DataViews>
	);
}

function NotificationsInbox( {
	category,
	note,
}: {
	category: InboxCategory;
	note: string | undefined;
} ) {
	const navigate = useNavigate();
	const { recordTracksEvent } = useAnalytics();
	const isDesktop = useViewportMatch( 'medium' );
	const { notes } = useVisibleNotes( CATEGORY_TO_TAB[ category ] );

	// Whether this category has had a selection (auto or explicit). Auto-open
	// runs once per category and never overrides a deep link, a user's pick,
	// or an explicit close.
	const hasSelectedRef = useRef( false );

	useEffect( () => {
		hasSelectedRef.current = false;
	}, [ category ] );

	useEffect( () => {
		if ( note ) {
			hasSelectedRef.current = true;
		}
	}, [ note ] );

	useEffect( () => acquireEngineVisibility(), [] );

	// The engine's filter is process-global and the bell dropdown resets it, so
	// re-assert this screen's category on mount and on every change.
	useEffect( () => {
		setActiveTab( CATEGORY_TO_TAB[ category ] );
	}, [ category ] );

	// The selection lives in the path: an unfiltered list carries the note id
	// as its only segment, a filtered one appends it to the category.
	const navigateToNote = useCallback(
		( noteId: string | undefined, replace = false ) => {
			if ( ! noteId ) {
				if ( category === 'all' ) {
					navigate( { to: '/notifications', replace } );
				} else {
					navigate( { to: '/notifications/$category', params: { category }, replace } );
				}
				return;
			}
			if ( category === 'all' ) {
				navigate( { to: '/notifications/$category', params: { category: noteId }, replace } );
			} else {
				navigate( {
					to: '/notifications/$category/$noteId',
					params: { category, noteId },
					replace,
				} );
			}
		},
		[ category, navigate ]
	);

	const setSelectedNote = ( noteId: string | undefined ) => {
		hasSelectedRef.current = true;
		if ( noteId ) {
			recordTracksEvent( 'calypso_dashboard_notifications_inbox_note_open', {
				category,
			} );
		}
		navigateToNote( noteId );
	};

	// Opening through the normal path (the note segment renders the detail pane,
	// which calls openNote) marks the note read, exactly like a real open. On
	// mobile the detail pane replaces the list, so auto-open would hide it — skip.
	const handleFirstNoteLoaded = useCallback(
		( firstNoteId: string ) => {
			if ( note || hasSelectedRef.current || ! isDesktop ) {
				return;
			}
			hasSelectedRef.current = true;
			navigateToNote( firstNoteId, true );
		},
		[ note, isDesktop, navigateToNote ]
	);

	// Previous/next walk the tab's list order; a deep-linked note that isn't
	// in the loaded list disables both.
	const noteIds = notes.map( ( { id } ) => id.toString() );
	const currentIndex = note ? noteIds.indexOf( note ) : -1;
	const onPrevious = currentIndex > 0 ? () => setSelectedNote( noteIds[ currentIndex - 1 ] ) : null;
	const onNext =
		currentIndex >= 0 && currentIndex < noteIds.length - 1
			? () => setSelectedNote( noteIds[ currentIndex + 1 ] )
			: null;

	return (
		<PageLayout header={ <PageHeader title={ __( 'Notifications' ) } /> }>
			<div
				className={ `dashboard-notifications-inbox__layout ${ note ? 'has-selected-note' : '' }` }
			>
				<div className="dashboard-notifications-inbox__list">
					<DataViewsCard>
						<InboxList
							key={ category }
							category={ category }
							selectedNoteId={ note }
							onSelectNote={ setSelectedNote }
							onFirstNoteLoaded={ handleFirstNoteLoaded }
						/>
					</DataViewsCard>
				</div>
				<div className="dashboard-notifications-inbox__detail-pane">
					{ note ? (
						<NoteDetail
							noteId={ note }
							onClose={ () => setSelectedNote( undefined ) }
							onPrevious={ onPrevious }
							onNext={ onNext }
						/>
					) : (
						<VStack
							alignment="center"
							className="dashboard-notifications-inbox__detail-placeholder"
						>
							<Text variant="muted">{ __( 'Select a notification to read it.' ) }</Text>
						</VStack>
					) }
				</div>
			</div>
		</PageLayout>
	);
}

export default function NotificationsInboxScreen( props: {
	category: string;
	note: string | undefined;
} ) {
	return (
		<NotesProvider>
			<NotificationsInbox
				category={ ( props.category as InboxCategory ) ?? 'all' }
				note={ props.note }
			/>
		</NotesProvider>
	);
}
