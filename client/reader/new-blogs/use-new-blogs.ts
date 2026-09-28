/**
 * Data hook for the "Discover new blogs" module (READ-542).
 *
 * Reads the caller's recommendations from `GET /wpcom/v2/reader/new-blogs`
 * (see `readNewBlogsQuery`). The endpoint applies the serve-time
 * public/deleted guard and caps the list; the client hydrates each
 * ( blogId, postId ) per card via `usePost`.
 *
 * Dismissed blogs and the hidden flag live in localStorage until the
 * server-side dismiss store exists (READ-542 layer 3).
 *
 * See client/reader/new-blogs/README.md.
 */
import { readNewBlogsQuery } from '@automattic/api-queries';
import { isEnabled } from '@automattic/calypso-config';
import { useQuery } from '@tanstack/react-query';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useMemo, useState } from 'react';
import { useDismissRecommendedSite } from 'calypso/reader/data/recommended-sites';
import { useDispatch, useSelector } from 'calypso/state';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import type { ReadNewBlogsRec } from '@automattic/api-core';

const DISMISSED_STORAGE_KEY = 'reader-new-blogs-dismissed-v1';
const HIDDEN_STORAGE_KEY = 'reader-new-blogs-hidden-v1';

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

export interface UseNewBlogsResult {
	/**
	 * Recommendations to render, best-first, minus dismissed blogs. Empty means
	 * loading, cold-start, or everything dismissed: the caller renders nothing.
	 */
	recs: ReadNewBlogsRec[];
	/** True when the user hid the whole module. */
	isHidden: boolean;
	/** "Not interested": hide every rec from this blog, now and on reload. */
	dismissBlog: ( blogId: number ) => void;
	/** Hide the whole module. */
	hide: () => void;
}

export function useNewBlogs(): UseNewBlogsResult {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const isLoggedIn = useSelector( isUserLoggedIn );
	const [ dismissedBlogs, setDismissedBlogs ] = useState< Set< number > >(
		() => new Set( readStorage< number[] >( DISMISSED_STORAGE_KEY, [] ) )
	);
	const [ isHidden, setIsHidden ] = useState< boolean >( () =>
		readStorage< boolean >( HIDDEN_STORAGE_KEY, false )
	);
	const { mutate: dismissRecommendedSite } = useDismissRecommendedSite();

	// Only fetch with the flag on, when logged in (the endpoint is user-scoped)
	// and while the module isn't hidden.
	const { data } = useQuery( {
		...readNewBlogsQuery(),
		enabled: isEnabled( 'reader/discover-new-blogs' ) && isLoggedIn && ! isHidden,
	} );

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
			// dismiss against the recs snapshot once the dismiss store exists.
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

	const recs = useMemo(
		() => ( data?.recs ?? [] ).filter( ( rec ) => ! dismissedBlogs.has( rec.blogId ) ),
		[ data, dismissedBlogs ]
	);

	return { recs, isHidden, dismissBlog, hide };
}
