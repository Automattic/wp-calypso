import { useNavigate } from '@tanstack/react-router';
import {
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
	Notice,
} from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { __ } from '@wordpress/i18n';
import { useCallback, useEffect, useRef } from 'react';
import { useAnalytics } from '../app/analytics';
import { DataViewsCard } from '../components/dataviews';
import { PageHeader } from '../components/page-header';
import PageLayout from '../components/page-layout';
import { NotesProvider, acquireEngineVisibility, setActiveTab, useVisibleNotes } from './engine';
import { CATEGORY_TO_TAB, InboxList } from './list';
import NoteDetail from './note-detail';
import {
	InboxVariantPicker,
	InboxVariantProvider,
	ListVariantPicker,
	useInboxVariantState,
	useListVariantState,
} from './variants';
import type { InboxCategory } from './list';

export type { InboxCategory } from './list';

import './style.scss';

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

	const [ variant, setVariantKey ] = useInboxVariantState();
	const [ listVariant, setListVariantKey ] = useListVariantState();

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

	const List = listVariant.List ?? InboxList;
	const DetailPane = variant.DetailPane ?? NoteDetail;

	const listNode = (
		<DataViewsCard>
			<List
				key={ category }
				category={ category }
				selectedNoteId={ note }
				onSelectNote={ setSelectedNote }
				onFirstNoteLoaded={ handleFirstNoteLoaded }
			/>
		</DataViewsCard>
	);

	const detailNode = note ? (
		<DetailPane
			noteId={ note }
			onClose={ () => setSelectedNote( undefined ) }
			onPrevious={ onPrevious }
			onNext={ onNext }
		/>
	) : (
		<VStack alignment="center" className="dashboard-notifications-inbox__detail-placeholder">
			<Text variant="muted">{ __( 'Select a notification to read it.' ) }</Text>
		</VStack>
	);

	return (
		<PageLayout header={ <PageHeader title={ __( 'Notifications' ) } /> }>
			<Notice
				className="dashboard-notifications-inbox__experimental-notice"
				status="warning"
				isDismissible={ false }
			>
				<HStack spacing={ 4 } justify="space-between" alignment="center" wrap>
					<Text>
						{ __(
							'This page is an internal experiment. Layouts are being compared and will change without notice.'
						) }
					</Text>
					<HStack spacing={ 3 } expanded={ false } justify="flex-end" wrap>
						<ListVariantPicker value={ listVariant.key } onChange={ setListVariantKey } />
						<InboxVariantPicker value={ variant.key } onChange={ setVariantKey } />
					</HStack>
				</HStack>
			</Notice>
			<InboxVariantProvider value={ variant }>
				{ variant.Shell ? (
					<variant.Shell list={ listNode } detail={ detailNode } hasSelectedNote={ !! note } />
				) : (
					<div
						className={ `dashboard-notifications-inbox__layout ${ variant.className ?? '' } ${
							note ? 'has-selected-note' : ''
						}` }
					>
						<div className="dashboard-notifications-inbox__list">{ listNode }</div>
						<div className="dashboard-notifications-inbox__detail-pane">{ detailNode }</div>
					</div>
				) }
			</InboxVariantProvider>
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
