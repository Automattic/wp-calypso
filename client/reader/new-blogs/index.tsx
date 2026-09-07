/**
 * "Discover new blogs" — bounded in-feed module in the Reader's Recent feed
 * (READ-542), following the design on the Reader Content Discovery
 * Experiment project and the placement agreed in the issue thread.
 *
 * PRD constraints enforced here / by the caller:
 *   - Bounded + clearly labelled; a single block in the Recent stream (via
 *     Stream's `inStreamBlock`) in the third spot, after two recent posts.
 *   - Fixed at 3 posts (no selector — keeps the data comparable).
 *   - One lightweight control per item: the X = "not interested", which hides
 *     the card immediately and keeps that blog's posts from coming back.
 *   - "Hide" dismisses the whole module.
 *   - "More like this" pages to the next 3 recs (count stays fixed).
 *   - Cold-start users (no snapshot row) see nothing — the caller doesn't
 *     mount the block at all.
 *   - Serve-time public/deleted check: server-side in the endpoint (READ-542
 *     layer 2) and re-checked here by hydrating each post through the Reader
 *     post store — an error post never renders.
 *
 * Gate this behind `isEnabled( 'reader/discover-new-blogs' )` at
 * the mount site.
 */
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'calypso/state';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import OonRecCard from './card';
import type { UseOonRecsResult } from './use-oon-recs';
import './style.scss';

/** Fixed number of cards, per the READ-542 answers. */
export const DISPLAY_LIMIT = 3;

type Props = Pick< UseOonRecsResult, 'recs' | 'dismissBlog' | 'hide' >;

export default function DiscoverNewBlogs( { recs, dismissBlog, hide }: Props ) {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const [ requestedPage, setPage ] = useState( 0 );
	// Dismissing shrinks `recs`; if that empties the current page, fall back to
	// the last page that still has cards instead of rendering nothing.
	const lastPage = Math.max( 0, Math.ceil( recs.length / DISPLAY_LIMIT ) - 1 );
	const page = Math.min( requestedPage, lastPage );
	const start = page * DISPLAY_LIMIT;
	const visible = recs.slice( start, start + DISPLAY_LIMIT );
	const hasMore = recs.length > start + DISPLAY_LIMIT;

	// One impression event per mount.
	const trackedRef = useRef( false );
	useEffect( () => {
		if ( visible.length > 0 && ! trackedRef.current ) {
			trackedRef.current = true;
			dispatch(
				recordReaderTracksEvent( 'calypso_reader_discover_new_blogs_render', {
					count: visible.length,
				} )
			);
		}
	}, [ dispatch, visible.length ] );

	if ( visible.length === 0 ) {
		return null;
	}

	const handleDismiss = ( blogId: number, postId: number ) => {
		dispatch(
			recordReaderTracksEvent( 'calypso_reader_discover_new_blogs_dismiss', {
				blog_id: blogId,
				post_id: postId,
			} )
		);
		dismissBlog( blogId );
	};

	const handleMore = () => {
		dispatch(
			recordReaderTracksEvent( 'calypso_reader_discover_new_blogs_more_click', { page: page + 1 } )
		);
		setPage( page + 1 );
	};

	const handleHide = () => {
		dispatch(
			recordReaderTracksEvent( 'calypso_reader_discover_new_blogs_hide', { count: visible.length } )
		);
		hide();
	};

	return (
		<section className="reader-discover-new-blogs" aria-label={ translate( 'Discover new blogs' ) }>
			<div className="reader-discover-new-blogs__header">
				<h2 className="reader-discover-new-blogs__heading">
					{ translate( 'Discover new blogs' ) }
				</h2>
				<Button variant="link" className="reader-discover-new-blogs__hide" onClick={ handleHide }>
					{ translate( 'Hide' ) }
				</Button>
			</div>

			<ul className="reader-discover-new-blogs__list">
				{ visible.map( ( rec ) => (
					<OonRecCard
						key={ `${ rec.blogId }-${ rec.postId }` }
						rec={ rec }
						onDismiss={ () => handleDismiss( rec.blogId, rec.postId ) }
						onOpen={ () =>
							dispatch(
								recordReaderTracksEvent( 'calypso_reader_discover_new_blogs_post_click', {
									blog_id: rec.blogId,
									post_id: rec.postId,
								} )
							)
						}
						onFollowToggle={ ( isFollowing ) =>
							dispatch(
								recordReaderTracksEvent( 'calypso_reader_discover_new_blogs_follow_toggle', {
									blog_id: rec.blogId,
									post_id: rec.postId,
									following: isFollowing,
								} )
							)
						}
					/>
				) ) }
			</ul>

			{ hasMore && (
				<Button variant="link" className="reader-discover-new-blogs__more" onClick={ handleMore }>
					{ translate( 'More like this' ) }
				</Button>
			) }
		</section>
	);
}
