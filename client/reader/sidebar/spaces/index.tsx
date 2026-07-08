import { readSpaceQuery } from '@automattic/api-queries';
import page from '@automattic/calypso-router';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useState } from 'react';
import AsyncLoad from 'calypso/components/async-load';
import ExpandableSidebarMenu from 'calypso/layout/sidebar/expandable';
import { useSpaces } from 'calypso/reader/data/spaces';
import { prefetchInfiniteStream } from 'calypso/reader/data/stream';
import { AddMenuItem } from 'calypso/reader/sidebar/menu';
import { CreateSpaceModal } from 'calypso/reader/spaces/create-modal';
import {
	READER_SPACES_ONBOARDING_DEBUG_KEY,
	READER_SPACES_ONBOARDING_SEEN_PREFERENCE_KEY,
} from 'calypso/reader/spaces/onboarding-modal/constants';
import { getSpacePath, SPACES_BASE_PATH } from 'calypso/reader/spaces/routes';
import { useDispatch, useSelector } from 'calypso/state';
import { savePreference } from 'calypso/state/preferences/actions';
import { getPreference, hasReceivedRemotePreferences } from 'calypso/state/preferences/selectors';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import getPreviousRoute from 'calypso/state/selectors/get-previous-route';
import { SpaceMenuItem } from './menu-item';
import type { ReadSpace } from '@automattic/api-core';

import './style.scss';

interface Props {
	path: string;
}

// Lazy loader for the onboarding walkthrough. Defined at module scope so the
// reference stays stable across renders (AsyncLoad memoizes on it).
const loadOnboardingModal = () => import( 'calypso/reader/spaces/onboarding-modal' );

// Debug override — force the walkthrough to show regardless of the "seen"
// preference. Toggle from the browser console:
// `localStorage.setItem( 'reader_spaces_onboarding_debug', '1' )`.
function isOnboardingForced(): boolean {
	try {
		return window.localStorage.getItem( READER_SPACES_ONBOARDING_DEBUG_KEY ) === '1';
	} catch {
		return false;
	}
}

// Space ids are URL-safe (base36), so the path segment is the id verbatim — no
// decoding is needed, and there is nothing for a bad URL to throw on. Mirrors
// getActiveConnection in the Social Feeds section.
function parseSpaceId( path: string ): string | null {
	const match = path.match( /^\/reader\/spaces\/([^/?]+)/ );
	return match ? match[ 1 ] : null;
}

// A full-post route (`/reader/feeds/:id/posts/:id` or `/reader/blogs/...`), where
// no top-level sidebar stream is active.
const READER_POST_PATH = /^\/reader\/(?:feeds|blogs)\/[^/]+\/posts\/[^/?]+/;

/**
 * The space whose row should read as active. Normally that's the space route
 * we're on. But opening a post navigates to a post route that carries no space,
 * so the highlight would drop the moment you start reading. While on a post
 * route, fall back to the route we came from: if we arrived from a space, keep
 * that space highlighted so the reading session still reads as "in" it. The
 * fallback is scoped to post routes, so landing on another stream (Following,
 * a tag, …) highlights that stream instead, never a stale space.
 */
function getActiveSpaceId( path: string, previousRoute: string ): string | null {
	const direct = parseSpaceId( path );
	if ( direct ) {
		return direct;
	}
	if ( READER_POST_PATH.test( path ) ) {
		return parseSpaceId( previousRoute );
	}
	return null;
}

export function ReaderSidebarSpaces( { path }: Props ) {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const queryClient = useQueryClient();
	const spaces = useSpaces();
	const previousRoute = useSelector( getPreviousRoute );

	const activeId = getActiveSpaceId( path, previousRoute );
	const isOnSpaces = path === SPACES_BASE_PATH || path.startsWith( `${ SPACES_BASE_PATH }/` );
	// Expand the section whenever a space is active — on a space route, or while
	// reading a post opened from one — so the highlighted space stays in view
	// (including on a direct load of such a post, where there's no open state yet).
	const hasActiveSpace = isOnSpaces || activeId !== null;

	const [ isOpen, setIsOpen ] = useState( () => hasActiveSpace );
	const [ isCreateModalOpen, setIsCreateModalOpen ] = useState( false );
	const [ isOnboardingOpen, setIsOnboardingOpen ] = useState( false );

	const preferencesLoaded = useSelector( hasReceivedRemotePreferences );
	const hasSeenOnboarding = useSelector( ( state ) =>
		getPreference( state, READER_SPACES_ONBOARDING_SEEN_PREFERENCE_KEY )
	);

	useEffect( () => {
		if ( hasActiveSpace ) {
			setIsOpen( true );
		}
	}, [ hasActiveSpace ] );

	const recordSpaceClick = ( id: string ) => {
		dispatch( recordReaderTracksEvent( 'calypso_reader_sidebar_space_clicked', { space: id } ) );
	};

	// Warm the feed on hover/focus so the view paints from cache on click. The
	// stream query's 5-minute staleTime makes repeated hovers cheap no-ops.
	const prefetchSpace = ( id: string ) => {
		// Skip the space we're already viewing — its data is loaded (or loading).
		if ( id === activeId ) {
			return;
		}
		void prefetchInfiniteStream( queryClient, dispatch, {
			streamKey: `space:${ id }`,
			enabled: true,
		} );
		void queryClient.prefetchQuery( readSpaceQuery( id ) );
	};

	const handleAddSpaceClick = () => {
		dispatch( recordReaderTracksEvent( 'calypso_reader_sidebar_spaces_add_clicked' ) );
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
		dispatch( savePreference( READER_SPACES_ONBOARDING_SEEN_PREFERENCE_KEY, true ) );
		setIsOnboardingOpen( false );
	};

	const handleOnboardingProceed = () => {
		markOnboardingSeen();
		setIsCreateModalOpen( true );
	};

	const handleSpaceCreated = ( space: ReadSpace ) => {
		page( getSpacePath( space.id ) );
	};

	return (
		<li>
			<ExpandableSidebarMenu
				expanded={ isOpen }
				title={ translate( 'Spaces' ) }
				onClick={ handleToggleExpand }
				expandableIconClick={ () => setIsOpen( ! isOpen ) }
				disableFlyout
				className={ ! isOpen && isOnSpaces ? 'sidebar__menu--selected' : undefined }
				count={ undefined }
				icon={ null }
				materialIcon={ null }
				materialIconStyle={ null }
			>
				{ spaces.map( ( space ) => (
					<SpaceMenuItem
						key={ space.id }
						space={ space }
						isSelected={ activeId === space.id }
						onClick={ () => recordSpaceClick( space.id ) }
						onPrefetch={ () => prefetchSpace( space.id ) }
					/>
				) ) }
				<AddMenuItem label={ translate( 'Create a space' ) } onClick={ handleAddSpaceClick } />
			</ExpandableSidebarMenu>
			{ isOnboardingOpen && (
				<AsyncLoad
					require={ loadOnboardingModal }
					placeholder={ null }
					onProceed={ handleOnboardingProceed }
					onClose={ markOnboardingSeen }
				/>
			) }
			<CreateSpaceModal
				isOpen={ isCreateModalOpen }
				onClose={ () => setIsCreateModalOpen( false ) }
				onCreated={ handleSpaceCreated }
			/>
		</li>
	);
}
