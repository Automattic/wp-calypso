/**
 * "Discover new blogs" — bounded, feature-flagged block in the Reader's Recent
 * feed (READ-542). Shows a fixed 3 recommendations with a per-card
 * "not interested" X, a "More like this" pager and a "Hide" link.
 *
 * The caller owns the data and the flag: it renders nothing when `recs` is
 * empty, so cold-start users never see an empty state.
 *
 * See client/reader/new-blogs/README.md.
 */
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'calypso/state';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import NewBlogCard from './card';
import type { UseNewBlogsResult } from './use-new-blogs';
import './style.scss';

/** Fixed number of cards, per the READ-542 answers (no selector: keeps the A/B data comparable). */
const DISPLAY_LIMIT = 3;

type Props = Pick< UseNewBlogsResult, 'recs' | 'dismissBlog' | 'hide' >;

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
					<NewBlogCard
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
