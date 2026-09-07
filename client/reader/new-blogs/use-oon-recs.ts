/**
 * Data hook for the "Discover new blogs" module (READ-542).
 *
 * Today it is mock-only: `USE_MOCK` is forced on because the backend endpoint
 * (`GET /wpcom/v2/reader/discover/blogs-you-dont-follow`, READ-542 layer 4)
 * does not exist yet. The real branch is written out but unreachable — flip
 * `USE_MOCK` to `false` once the endpoint ships and delete the mock import.
 *
 * The hook only resolves ( blogId, postId, score ) triples — the same shape the
 * endpoint will return. Post hydration happens per card via `usePost`.
 *
 * State the module needs and this hook resolves:
 *   - recs          ordered best-first, minus posts from dismissed blogs
 *   - isColdStart   no snapshot row for the user -> module renders nothing
 *   - isHidden      user hid the whole module ("Hide")
 *   - dismissBlog() the X on a card = "not interested": drops every rec from
 *                   that blog, persists it, and reuses the Reader's existing
 *                   recommended-site dismiss so the blog stays out of
 *                   recommendations (per the READ-542 answers). The server
 *                   call is skipped while USE_MOCK is on.
 *   - hide()        hides the module, persisted locally.
 *
 * Demoing states without code edits — append to the Recent (/read) URL:
 *   ?oon_mock=111       render user 111's short list
 *   ?oon_mock=222       one deleted post id -> exercises the serve-time guard
 *   ?oon_mock=23314024  render the healthy list
 *   ?oon_mock=cold      force cold-start (module hidden)
 */
import { useTranslate } from 'i18n-calypso';
import { useCallback, useMemo, useState } from 'react';
import { useDismissRecommendedSite } from 'calypso/reader/data/recommended-sites';
import { useDispatch, useSelector } from 'calypso/state';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { MOCK_OON_RECS, MOCK_DEFAULT_USER_ID } from './mock-data';
import type { OonRec, OonRecsSnapshot } from './types';

const USE_MOCK = true; // TODO(READ-542): false once the endpoint exists.
const DISMISSED_STORAGE_KEY = 'reader-oon-dismissed-blogs-v1';
const HIDDEN_STORAGE_KEY = 'reader-oon-hidden-v1';

function readStorage< T >( key: string, fallback: T ): T {
	if ( typeof window === 'undefined' ) {
		return fallback;
	}
	try {
		const raw = window.localStorage.getItem( key );
		return raw ? ( JSON.parse( raw ) as T ) : fallback;
	} catch {
		return fallback;
	}
}

function writeStorage( key: string, value: unknown ): void {
	if ( typeof window === 'undefined' ) {
		return;
	}
	try {
		window.localStorage.setItem( key, JSON.stringify( value ) );
	} catch {
		// storage disabled / full — state just won't persist this session
	}
}

function mockOverrideFromUrl(): string | null {
	if ( typeof window === 'undefined' ) {
		return null;
	}
	return new URLSearchParams( window.location.search ).get( 'oon_mock' );
}

export interface UseOonRecsResult {
	/** Recommendations to render, best-first, minus dismissed blogs. */
	recs: OonRec[];
	/** True when the user has no snapshot row — caller renders nothing. */
	isColdStart: boolean;
	/** True when the user hid the whole module. */
	isHidden: boolean;
	isLoading: boolean;
	/** ISO timestamp of the snapshot, for a "recommended for you" footnote. */
	updated: string | null;
	/** "Not interested": hide every rec from this blog, now and on reload. */
	dismissBlog: ( blogId: number ) => void;
	/** Hide the whole module. */
	hide: () => void;
}

export function useOonRecs(): UseOonRecsResult {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const currentUserId = useSelector( getCurrentUserId );
	const [ dismissedBlogs, setDismissedBlogs ] = useState< Set< number > >(
		() => new Set( readStorage< number[] >( DISMISSED_STORAGE_KEY, [] ) )
	);
	const [ isHidden, setIsHidden ] = useState< boolean >( () =>
		readStorage< boolean >( HIDDEN_STORAGE_KEY, false )
	);
	const { mutate: dismissRecommendedSite } = useDismissRecommendedSite();

	const dismissBlog = useCallback(
		( blogId: number ) => {
			setDismissedBlogs( ( prev ) => {
				const next = new Set( prev );
				next.add( blogId );
				writeStorage( DISMISSED_STORAGE_KEY, [ ...next ] );
				return next;
			} );
			// Same server-side "don't recommend this site again" the sidebar's
			// Recommended sites card uses. TODO(READ-542 layer 3): also record the
			// dismiss against the OON snapshot once the dismiss store exists.
			//
			// Skipped in mock mode: the mock points at real blogs, and a demo click
			// must not permanently hide them from the tester's Reader.
			if ( USE_MOCK ) {
				return;
			}
			dismissRecommendedSite(
				{ siteId: blogId },
				{
					onSuccess: () => {
						dispatch(
							successNotice( translate( "We won't recommend this site to you again." ), {
								duration: 5000,
							} )
						);
					},
					onError: () => {
						dispatch(
							errorNotice( translate( 'Sorry, there was a problem dismissing that site.' ) )
						);
					},
				}
			);
		},
		[ dismissRecommendedSite, dispatch, translate ]
	);

	const hide = useCallback( () => {
		setIsHidden( true );
		writeStorage( HIDDEN_STORAGE_KEY, true );
	}, [] );

	// --- resolve the raw snapshot -------------------------------------------
	const snapshot = useMemo< OonRecsSnapshot | null >( () => {
		if ( ! USE_MOCK ) {
			// TODO(READ-542): replace with a react-query call:
			//   useQuery({
			//     queryKey: [ 'reader', 'oon-recs' ],
			//     queryFn: () => wpcom.req.get( '/reader/discover/blogs-you-dont-follow', { apiNamespace: 'wpcom/v2' } ),
			//   })
			// Endpoint returns { updated, recs: [ { blogId, postId, score } ] }.
			return null;
		}

		const override = mockOverrideFromUrl();
		if ( override === 'cold' ) {
			return { updated: '2026-08-31T00:00:00Z', recs: [] };
		}

		const overrideId = override ? Number( override ) : NaN;
		const lookupId = Number.isFinite( overrideId )
			? overrideId
			: ( currentUserId as number | null ) ?? MOCK_DEFAULT_USER_ID;

		// Fall back to the demo user so the module is visible as any account,
		// unless the caller explicitly asked for an id (then honour cold-start).
		return (
			MOCK_OON_RECS[ lookupId ] ??
			( override ? { updated: '', recs: [] } : MOCK_OON_RECS[ MOCK_DEFAULT_USER_ID ] )
		);
	}, [ currentUserId ] );

	// --- apply local dismissals -------------------------------------------
	const recs = useMemo( () => {
		const all = snapshot?.recs ?? [];
		return all.filter( ( r ) => ! dismissedBlogs.has( r.blogId ) );
	}, [ snapshot, dismissedBlogs ] );

	return {
		recs,
		isColdStart: ! snapshot || snapshot.recs.length === 0,
		isHidden,
		isLoading: false,
		updated: snapshot?.updated || null,
		dismissBlog,
		hide,
	};
}
