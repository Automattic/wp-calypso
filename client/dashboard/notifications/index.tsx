import { useNavigate } from '@tanstack/react-router';
import {
	__experimentalText as Text,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
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
import { getFields } from './fields';
import type { FilterName, Note } from './engine';
import type { View } from '@wordpress/dataviews';

import './style.scss';

// DataViews only loads more in response to scroll events, so the rendered
// window (`perPage` rows) must be tall enough to overflow the page and produce
// a scrollbar. The REST client may fetch smaller network pages; the effect
// below loads as many as needed to fill this window.
const NOTES_PER_PAGE = 20;

// Stable empty selection: rows are opened via `onChangeSelection` (the list
// layout's only row-click hook) but never stay selected — opening navigates
// to the note's own route.
const NO_SELECTION: string[] = [];

function InboxList( { tab }: { tab: FilterName } ) {
	const navigate = useNavigate();
	const { recordTracksEvent } = useAnalytics();
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

	const view = { ...initialView, perPage: NOTES_PER_PAGE };
	const startPosition = view.startPosition ?? 1;

	// Field identities must stay stable or DataViews remounts every cell per re-render.
	const fields = useMemo( () => getFields(), [] );

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
	// a short list still overflows the page and gets a scrollbar to drive more.
	useEffect( () => {
		if ( startPosition + NOTES_PER_PAGE > notes.length && ! isLoading && hasMore ) {
			infiniteScrollHandler();
		}
	}, [ startPosition, notes, isLoading, hasMore, infiniteScrollHandler ] );

	const onChangeSelection = ( selection: string[] ) => {
		const noteId = selection[ 0 ];
		if ( noteId ) {
			recordTracksEvent( 'calypso_dashboard_notifications_inbox_note_open' );
			navigate( { to: '/notifications/$noteId', params: { noteId } } );
		}
	};

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
			defaultLayouts={ { list: {} } }
			paginationInfo={ effectivePaginationInfo }
			empty={
				showEmptyLoader ? (
					<VStack alignment="center" style={ { padding: '40px 0' } }>
						<Spinner />
					</VStack>
				) : (
					<VStack alignment="center" style={ { padding: '40px 0' } }>
						<Text size={ 15 } weight={ 500 }>
							{ tab === 'unread' ? __( 'You’re all caught up.' ) : __( 'No notifications yet.' ) }
						</Text>
					</VStack>
				)
			}
			getItemId={ ( item ) => item.id.toString() }
			selection={ NO_SELECTION }
			onChangeView={ setView }
			onChangeSelection={ onChangeSelection }
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

function NotificationsInbox() {
	const [ tab, setTab ] = useState< FilterName >( 'all' );
	const { recordTracksEvent } = useAnalytics();

	useEffect( () => acquireEngineVisibility(), [] );

	// The engine's filter is process-global and the bell dropdown resets it, so
	// re-assert this screen's tab on mount and on every change.
	useEffect( () => {
		setActiveTab( tab );
	}, [ tab ] );

	return (
		<PageLayout header={ <PageHeader title={ __( 'Notifications' ) } /> }>
			<ToggleGroupControl
				label={ __( 'Filter notifications' ) }
				hideLabelFromVision
				value={ tab }
				__next40pxDefaultSize
				__nextHasNoMarginBottom
				onChange={ ( value ) => {
					const nextTab = ( value as FilterName ) ?? 'all';
					setTab( nextTab );
					recordTracksEvent( 'calypso_dashboard_notifications_inbox_tab_change', {
						tab: nextTab,
					} );
				} }
			>
				<ToggleGroupControlOption value="all" label={ __( 'All' ) } />
				<ToggleGroupControlOption value="unread" label={ __( 'Unread' ) } />
			</ToggleGroupControl>
			<DataViewsCard>
				<InboxList key={ tab } tab={ tab } />
			</DataViewsCard>
		</PageLayout>
	);
}

export default function NotificationsInboxScreen() {
	return (
		<NotesProvider>
			<NotificationsInbox />
		</NotesProvider>
	);
}
