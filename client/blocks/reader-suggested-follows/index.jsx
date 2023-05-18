import React from 'react';
import { connect, useDispatch } from 'react-redux';
import QueryReaderSite from 'calypso/components/data/query-reader-site';
import Gravatar from 'calypso/components/gravatar';
import Favicon from 'calypso/reader/components/favicon';
import ReaderFollowFeedIcon from 'calypso/reader/components/icons/follow-feed-icon';
import ReaderFollowingFeedIcon from 'calypso/reader/components/icons/following-feed-icon';
import FollowButton from 'calypso/reader/follow-button';
import { formatUrlForDisplay } from 'calypso/reader/lib/feed-display-helper';
import { recordAction, recordGaEvent } from 'calypso/reader/stats';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import { getPostById } from 'calypso/state/reader/posts/selectors';
import { getSite } from 'calypso/state/reader/sites/selectors';

import './style.scss';

const SuggestedFollowItem = ( { post, site, siteId } ) => {
	const dispatch = useDispatch();

	const onSiteClick = ( selectedSite ) => {
		recordAction( 'clicked_reader_suggested_following_item' );
		recordGaEvent( 'Clicked Reader Suggested Following Item' );
		dispatch(
			recordReaderTracksEvent( 'calypso_reader_suggested_following_item_clicked', {
				blog: decodeURIComponent( selectedSite.URL ),
			} )
		);
	};

	let streamLink = null;

	if ( site && site.feed_ID ) {
		streamLink = `/read/feeds/${ site.feed_ID }`;
	} else if ( site && site.blog_ID ) {
		// If subscription is missing a feed ID, fallback to blog stream
		streamLink = `/read/blogs/${ site.blog_ID }`;
	}

	const urlForDisplay = site && site.URL ? formatUrlForDisplay( site.URL ) : '';

	/* eslint-disable wpcalypso/jsx-classname-namespace */
	return (
		<div className="reader-suggested-follow-item">
			{ ! site && siteId && <QueryReaderSite siteId={ siteId } /> }
			{ site && (
				<>
					<a
						className="reader-suggested-follow-item_link"
						href={ streamLink }
						onClick={ () => onSiteClick( site ) }
						aria-hidden="true"
					>
						<span className="reader-suggested-follow-item_siteicon">
							{ site.site_icon && <Favicon site={ site } size={ 32 } /> }
							{ ! site.site_icon && <Gravatar user={ post.author } /> }
						</span>
						<span className="reader-suggested-follow-item_sitename">
							<span className="reader-suggested-follow-item_nameurl">
								{ site.name || urlForDisplay }
							</span>
							{ site.description?.length > 0 && (
								<span className="reader-suggested-follow-item_description">
									{ site.description }
								</span>
							) }
						</span>
					</a>
					<span className="reader-suggested-follow-button">
						<FollowButton
							siteUrl={ site.URL }
							railcar={ post.railcar }
							followIcon={ ReaderFollowFeedIcon( { iconSize: 20 } ) }
							followingIcon={ ReaderFollowingFeedIcon( { iconSize: 20 } ) }
						/>
					</span>
				</>
			) }
		</div>
	);
	/* eslint-enable wpcalypso/jsx-classname-namespace */
};

export default connect( ( state, ownProps ) => {
	const { post } = ownProps;
	const actualPost = getPostById( state, post );
	const siteId = actualPost && actualPost.site_ID;
	const site = siteId && getSite( state, siteId );

	return {
		post: actualPost,
		site: site && {
			...site,
			site_icon: site?.icon?.img,
		},
		siteId: siteId,
	};
} )( SuggestedFollowItem );
