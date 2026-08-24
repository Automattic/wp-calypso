import { useNavigate } from '@tanstack/react-router';
import {
	__experimentalText as Text,
	__experimentalVStack as VStack,
	Spinner,
} from '@wordpress/components';
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
	hasMoreNotesFor,
	loadMoreFor,
	setActiveTab,
	useVisibleNotes,
} from './engine';
import { buildTypeField, getFields } from './fields';
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
}: {
	category: InboxCategory;
	selectedNoteId: string | undefined;
	onSelectNote: ( noteId: string | undefined ) => void;
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
		search: '',
		infiniteScrollEnabled: true,
		startPosition: 1,
		// Group notes into time sections ("Today", "Yesterday", …). `direction`
		// is required by the type but inert, since `timeGroup` opts out of sorting.
		groupBy: { field: 'timeGroup', direction: 'asc', showLabel: false },
	} );

	const view = { ...initialView, perPage: NOTES_PER_PAGE };
	const startPosition = view.startPosition ?? 1;

	// Field identities must stay stable or DataViews remounts every cell per
	// re-render; the type filter's options are keyed by the loaded types.
	const typesKey = useMemo(
		() =>
			Array.from( new Set( notes.map( ( note ) => note.type ) ) )
				.sort()
				.join( ',' ),
		[ notes ]
	);
	const fields = useMemo(
		() => [ ...getFields(), buildTypeField( typesKey ? typesKey.split( ',' ) : [] ) ],
		[ typesKey ]
	);

	// Search and the type filter run client-side over the loaded notes only —
	// the engine's server filter is driven by the sidebar categories, never by
	// DataViews view state.
	const { data, paginationInfo } = filterSortAndPaginate( notes, view, fields );

	// `filterSortAndPaginate` reports `totalItems` as the count of notes loaded
	// so far, but DataViews advances its infinite-scroll window only while
	// `totalItems` stays ahead of the window. Report an optimistic total while
	// the engine still has notes left so DataViews keeps driving load-more.
	const hasMore = hasMoreNotesFor( tab );
	const effectivePaginationInfo = hasMore
		? { ...paginationInfo, totalItems: paginationInfo.totalItems + NOTES_PER_PAGE }
		: paginationInfo;

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
			search
			paginationInfo={ effectivePaginationInfo }
			empty={
				showEmptyLoader ? (
					<VStack alignment="center" style={ { padding: '40px 0' } }>
						<Spinner />
					</VStack>
				) : (
					<VStack alignment="center" style={ { padding: '40px 0' } }>
						<Text size={ 15 } weight={ 500 }>
							{ view.search || view.filters?.length
								? __( 'No notifications match your search.' )
								: EMPTY_MESSAGES[ category ] }
						</Text>
					</VStack>
				)
			}
			getItemId={ ( item ) => item.id.toString() }
			selection={ selectedNoteId ? [ selectedNoteId ] : [] }
			onChangeView={ setView }
			onChangeSelection={ ( selection ) => onSelectNote( selection[ 0 ] ) }
		>
			<DataViews.Layout />
			{ hasMore && data.length > 0 && isLoading && (
				// DataViews suppresses its own load-more spinner when notes are
				// grouped, so this stands in for it, below the list rows.
				<VStack alignment="center" style={ { flexShrink: 0, padding: '12px 0' } }>
					<Spinner />
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

	useEffect( () => acquireEngineVisibility(), [] );

	// The engine's filter is process-global and the bell dropdown resets it, so
	// re-assert this screen's category on mount and on every change.
	useEffect( () => {
		setActiveTab( CATEGORY_TO_TAB[ category ] );
	}, [ category ] );

	const setSelectedNote = ( noteId: string | undefined ) => {
		if ( noteId ) {
			recordTracksEvent( 'calypso_dashboard_notifications_inbox_note_open', {
				category,
			} );
		}
		navigate( {
			to: category === 'all' ? '/notifications' : '/notifications/$category',
			params: { category },
			search: { note: noteId },
		} );
	};

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
						/>
					</DataViewsCard>
				</div>
				<div className="dashboard-notifications-inbox__detail-pane">
					{ note ? (
						<NoteDetail noteId={ note } onClose={ () => setSelectedNote( undefined ) } />
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
