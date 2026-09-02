import {
	__experimentalText as Text,
	__experimentalVStack as VStack,
	Spinner,
} from '@wordpress/components';
import { filterSortAndPaginate, DataViews as WPDataViews } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../app/auth';
import { DataViews } from '../components/dataviews';
import { getListEndReason, hasMoreNotesFor, loadMoreFor, useVisibleNotes } from './engine';
import { getFields } from './fields';
import type { FilterName, Note } from './engine';
import type { View } from '@wordpress/dataviews';

// DataViews only loads more in response to scroll events, so the rendered
// window (`perPage` rows) must be tall enough to overflow the pane and produce
// a scrollbar. The REST client may fetch smaller network pages; the effect
// below loads as many as needed to fill this window.
const NOTES_PER_PAGE = 20;

export type InboxCategory = 'all' | 'unread' | 'comments' | 'subscribers' | 'likes';

// The left sidebar's category URLs mapped to the engine's server filters.
export const CATEGORY_TO_TAB: Record< InboxCategory, FilterName > = {
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

export function InboxList( {
	category,
	selectedNoteId,
	onSelectNote,
	onFirstNoteLoaded,
	descriptionField = 'meta',
}: {
	category: InboxCategory;
	selectedNoteId: string | undefined;
	onSelectNote: ( noteId: string | undefined ) => void;
	onFirstNoteLoaded: ( noteId: string ) => void;
	/** Which field renders a row's second line; Classic shows the excerpt. */
	descriptionField?: 'meta' | 'description';
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
		descriptionField,
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

	const { user } = useAuth();
	// Field identities must stay stable or DataViews remounts every cell per re-render.
	const fields = useMemo( () => getFields( { currentUserId: user.ID } ), [ user.ID ] );

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

	// DataViews scrolls its own layout container and offers no footer slot, so
	// the foot is portaled in after the rows to scroll with them.
	const sentinelRef = useRef< HTMLDivElement >( null );
	const [ scrollContainer, setScrollContainer ] = useState< HTMLElement | null >( null );
	useLayoutEffect( () => {
		setScrollContainer(
			sentinelRef.current?.parentElement?.querySelector< HTMLElement >(
				'.dataviews-layout__container'
			) ?? null
		);
	}, [ category, data.length ] );

	if ( ! hasInitiallyLoadedRef.current ) {
		return (
			<VStack alignment="center" style={ { padding: '40px 0' } }>
				<Spinner />
			</VStack>
		);
	}

	// Spinner instead of an empty message while the view may still be filling.
	const showEmptyLoader = hasMore || isLoading;

	const foot = (
		<>
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
		</>
	);

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
			<WPDataViews.Layout />
			<div ref={ sentinelRef } hidden />
			{ scrollContainer ? createPortal( foot, scrollContainer ) : foot }
		</DataViews>
	);
}
