import { readShelfBySlugQuery } from '@automattic/api-queries';
import page from '@automattic/calypso-router';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useState } from 'react';
import AsyncLoad from 'calypso/components/async-load';
import ExpandableSidebarMenu from 'calypso/layout/sidebar/expandable';
import { useShelves } from 'calypso/reader/data/shelves';
import { prefetchInfiniteStream } from 'calypso/reader/data/stream';
import { CreateShelfModal } from 'calypso/reader/shelves/create-modal';
import {
	READER_SHELVES_ONBOARDING_DEBUG_KEY,
	READER_SHELVES_ONBOARDING_SEEN_PREFERENCE_KEY,
} from 'calypso/reader/shelves/onboarding-modal/constants';
import { getShelfPath, SHELVES_BASE_PATH } from 'calypso/reader/shelves/routes';
import { AddMenuItem } from 'calypso/reader/sidebar/menu';
import { useDispatch, useSelector } from 'calypso/state';
import { savePreference } from 'calypso/state/preferences/actions';
import { getPreference, hasReceivedRemotePreferences } from 'calypso/state/preferences/selectors';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import getPreviousRoute from 'calypso/state/selectors/get-previous-route';
import { ShelfMenuItem } from './menu-item';
import type { ReadShelf } from '@automattic/api-core';

import './style.scss';

interface Props {
	path: string;
}

// Lazy loader for the onboarding walkthrough. Defined at module scope so the
// reference stays stable across renders (AsyncLoad memoizes on it).
const loadOnboardingModal = () => import( 'calypso/reader/shelves/onboarding-modal' );

// Debug override — force the walkthrough to show regardless of the "seen"
// preference. Toggle from the browser console:
// `localStorage.setItem( 'reader_shelves_onboarding_debug', '1' )`.
function isOnboardingForced(): boolean {
	try {
		return window.localStorage.getItem( READER_SHELVES_ONBOARDING_DEBUG_KEY ) === '1';
	} catch {
		return false;
	}
}

// Shelves are addressed in the URL by slug (`sanitize_title` form: lowercase,
// hyphens), so the first path segment is the slug verbatim. Mirrors
// getActiveConnection in the Social Feeds section.
function parseShelfSlug( path: string ): string | null {
	const match = path.match( /^\/reader\/shelves\/([^/?]+)/ );
	return match ? match[ 1 ] : null;
}

// A full-post route (`/reader/feeds/:id/posts/:id` or `/reader/blogs/...`), where
// no top-level sidebar stream is active.
const READER_POST_PATH = /^\/reader\/(?:feeds|blogs)\/[^/]+\/posts\/[^/?]+/;

/**
 * The shelf whose row should read as active. Normally that's the shelf route
 * we're on. But opening a post navigates to a post route that carries no shelf,
 * so the highlight would drop the moment you start reading. While on a post
 * route, fall back to the route we came from: if we arrived from a shelf, keep
 * that shelf highlighted so the reading session still reads as "in" it. The
 * fallback is scoped to post routes, so landing on another stream (Following,
 * a tag, …) highlights that stream instead, never a stale shelf.
 */
function getActiveShelfSlug( path: string, previousRoute: string ): string | null {
	const direct = parseShelfSlug( path );
	if ( direct ) {
		return direct;
	}
	if ( READER_POST_PATH.test( path ) ) {
		return parseShelfSlug( previousRoute );
	}
	return null;
}

export function ReaderSidebarShelves( { path }: Props ) {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const queryClient = useQueryClient();
	const shelves = useShelves();
	const previousRoute = useSelector( getPreviousRoute );

	const activeSlug = getActiveShelfSlug( path, previousRoute );
	const isOnShelves = path === SHELVES_BASE_PATH || path.startsWith( `${ SHELVES_BASE_PATH }/` );
	// Expand the section whenever a shelf is active — on a shelf route, or while
	// reading a post opened from one — so the highlighted shelf stays in view
	// (including on a direct load of such a post, where there's no open state yet).
	const hasActiveShelf = isOnShelves || activeSlug !== null;

	const [ isOpen, setIsOpen ] = useState( () => hasActiveShelf );
	const [ isCreateModalOpen, setIsCreateModalOpen ] = useState( false );
	const [ isOnboardingOpen, setIsOnboardingOpen ] = useState( false );

	const preferencesLoaded = useSelector( hasReceivedRemotePreferences );
	const hasSeenOnboarding = useSelector( ( state ) =>
		getPreference( state, READER_SHELVES_ONBOARDING_SEEN_PREFERENCE_KEY )
	);

	useEffect( () => {
		if ( hasActiveShelf ) {
			setIsOpen( true );
		}
	}, [ hasActiveShelf ] );

	const recordShelfClick = ( id: string ) => {
		dispatch( recordReaderTracksEvent( 'calypso_reader_sidebar_shelf_clicked', { shelf: id } ) );
	};

	// Warm the feed on hover/focus so the view paints from cache on click. The
	// stream query's 5-minute staleTime makes repeated hovers cheap no-ops. The view
	// resolves the detail by slug and the stream by the numeric id, so warm both.
	const prefetchShelf = ( shelf: ReadShelf ) => {
		// Skip the shelf we're already viewing — its data is loaded (or loading).
		if ( shelf.slug === activeSlug ) {
			return;
		}
		void prefetchInfiniteStream( queryClient, dispatch, {
			streamKey: `shelf:${ shelf.id }`,
			enabled: true,
		} );
		void queryClient.prefetchQuery( readShelfBySlugQuery( shelf.slug ) );
	};

	const handleAddShelfClick = () => {
		dispatch( recordReaderTracksEvent( 'calypso_reader_sidebar_shelves_add_clicked' ) );
		// Show the first-time walkthrough before the create form, but only once we
		// know the user hasn't seen it — an unhydrated preference reads as null and
		// would look like "not seen", so fall through to the create form until then.
		// The debug override forces it regardless, for manual testing.
		if ( isOnboardingForced() || ( preferencesLoaded && ! hasSeenOnboarding ) ) {
			setIsOnboardingOpen( true );
			return;
		}
		setIsCreateModalOpen( true );
	};

	const handleToggleExpand = useCallback( () => setIsOpen( ( open ) => ! open ), [] );

	const markOnboardingSeen = () => {
		dispatch( savePreference( READER_SHELVES_ONBOARDING_SEEN_PREFERENCE_KEY, true ) );
		setIsOnboardingOpen( false );
	};

	const handleOnboardingProceed = () => {
		markOnboardingSeen();
		setIsCreateModalOpen( true );
	};

	const handleShelfCreated = ( shelf: ReadShelf ) => {
		page( getShelfPath( shelf.slug ) );
	};

	return (
		<li>
			<ExpandableSidebarMenu
				expanded={ isOpen }
				title={ translate( 'Shelves' ) }
				onClick={ handleToggleExpand }
				expandableIconClick={ () => setIsOpen( ! isOpen ) }
				disableFlyout
				className={ ! isOpen && isOnShelves ? 'sidebar__menu--selected' : undefined }
				count={ undefined }
				icon={ null }
				materialIcon={ null }
				materialIconStyle={ null }
			>
				{ shelves.map( ( shelf ) => (
					<ShelfMenuItem
						key={ shelf.id }
						shelf={ shelf }
						isSelected={ activeSlug === shelf.slug }
						onClick={ () => recordShelfClick( shelf.id ) }
						onPrefetch={ () => prefetchShelf( shelf ) }
					/>
				) ) }
				<AddMenuItem label={ translate( 'Create a shelf' ) } onClick={ handleAddShelfClick } />
			</ExpandableSidebarMenu>
			{ isOnboardingOpen && (
				<AsyncLoad
					require={ loadOnboardingModal }
					placeholder={ null }
					onProceed={ handleOnboardingProceed }
					onClose={ markOnboardingSeen }
				/>
			) }
			<CreateShelfModal
				isOpen={ isCreateModalOpen }
				onClose={ () => setIsCreateModalOpen( false ) }
				onCreated={ handleShelfCreated }
			/>
		</li>
	);
}
