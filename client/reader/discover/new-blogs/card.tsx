/**
 * One card in the "Discover new blogs" module, per the project design:
 *
 *   [site icon] Site name                       [Subscribe] [X]
 *   Post title
 *   Two-line excerpt
 *
 * The rec is hydrated by ( blogId, postId ) through the Reader post store,
 * which is also where the client-side half of the serve-time guard lives: an
 * error post (deleted / private / not found) renders nothing.
 */
import { Button } from '@wordpress/components';
import { close } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useState, type MouseEvent } from 'react';
import ReaderExcerpt from 'calypso/blocks/reader-excerpt';
import { SiteIcon } from 'calypso/blocks/site-icon';
import { useFeedQuery } from 'calypso/reader/data/feed';
import { usePost } from 'calypso/reader/data/post';
import { useSite } from 'calypso/reader/data/site';
import ReaderFollowButton from 'calypso/reader/follow-button';
import { READER_DISCOVER_NEW_BLOGS } from 'calypso/reader/follow-sources';
import { getSiteName } from 'calypso/reader/get-helpers';
import { getStreamUrl } from 'calypso/reader/route';
import { showSelectedPost } from 'calypso/reader/utils';
import OonRecCardPlaceholder from './placeholder';
import type { OonRec } from './types';

interface Props {
	rec: OonRec;
	onDismiss: () => void;
	onOpen: () => void;
	onFollowToggle: ( isFollowing: boolean ) => void;
}

export default function OonRecCard( { rec, onDismiss, onOpen, onFollowToggle }: Props ) {
	const translate = useTranslate();
	const postKey = { blogId: rec.blogId, postId: rec.postId };
	const { data: post, isLoading } = usePost( postKey );
	const siteId = post?.site_ID ? Number( post.site_ID ) : undefined;
	const feedId = post?.feed_ID ? Number( post.feed_ID ) : undefined;
	const { site } = useSite( siteId );
	const { data: feed } = useFeedQuery( feedId );
	// ReaderExcerpt reports back whether the post actually has an excerpt.
	const [ hasExcerpt, setHasExcerpt ] = useState( true );

	// Keep the block's height while the post hydrates so the feed doesn't jump.
	if ( ! post && isLoading ) {
		return <OonRecCardPlaceholder />;
	}

	// Failed the serve-time guard (deleted / private / 404): render nothing.
	if ( ! post || post.is_error ) {
		return null;
	}

	const siteName = getSiteName( { site, feed, post: post as never } ) ?? '';
	const siteUrl = ( post.feed_URL || post.site_URL || site?.URL || '' ) as string;
	const siteIcon = feed?.site_icon ?? feed?.image ?? site?.icon?.img;
	const streamUrl = getStreamUrl( feedId, siteId );

	const openPost = ( event: MouseEvent ) => {
		event.preventDefault();
		onOpen();
		showSelectedPost( { postKey } )();
	};

	return (
		<li className="reader-discover-new-blogs__card">
			<div className="reader-discover-new-blogs__card-head">
				<a className="reader-discover-new-blogs__site" href={ streamUrl }>
					<SiteIcon iconUrl={ siteIcon } size={ 24 } />
					<span className="reader-discover-new-blogs__site-name">{ siteName }</span>
				</a>
				<div className="reader-discover-new-blogs__card-actions">
					<ReaderFollowButton
						siteId={ siteId }
						feedId={ feedId }
						siteUrl={ siteUrl }
						followSource={ READER_DISCOVER_NEW_BLOGS }
						className="reader-discover-new-blogs__subscribe"
						onFollowToggle={ onFollowToggle }
					/>
					<Button
						className="reader-discover-new-blogs__dismiss"
						icon={ close }
						iconSize={ 14 }
						label={ translate( 'Not interested' ) }
						showTooltip
						onClick={ onDismiss }
					/>
				</div>
			</div>
			<h3 className="reader-discover-new-blogs__title">
				<a href={ post.URL as string } onClick={ openPost }>
					{ post.title as string }
				</a>
			</h3>
			{ hasExcerpt && (
				<div className="reader-discover-new-blogs__excerpt">
					<ReaderExcerpt
						post={ post }
						hasExcerpt={ hasExcerpt }
						showExcerpt
						setHasExcerpt={ setHasExcerpt }
					/>
				</div>
			) }
		</li>
	);
}
