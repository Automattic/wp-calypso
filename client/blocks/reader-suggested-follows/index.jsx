import React from 'react';
import { connect, useDispatch } from 'react-redux';
import Gravatar from 'calypso/components/gravatar';
import { decodeEntities } from 'calypso/lib/formatting';
import Favicon from 'calypso/reader/components/favicon';
import ReaderFollowFeedIcon from 'calypso/reader/components/icons/follow-feed-icon';
import ReaderFollowingFeedIcon from 'calypso/reader/components/icons/following-feed-icon';
import FollowButton from 'calypso/reader/follow-button';
import { formatUrlForDisplay } from 'calypso/reader/lib/feed-display-helper';
import { recordAction, recordGaEvent } from 'calypso/reader/stats';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import { getPostById } from 'calypso/state/reader/posts/selectors';
import './style.scss';

const SuggestedFollowItem = ( { post, site } ) => {
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
			{ site && (
				<>
					<a
						className="reader-suggested-follow-item_link"
						href={ streamLink }
						onClick={ () => onSiteClick( site ) }
						aria-hidden="true"
					>
						<span className="reader-suggested-follow-item_siteicon">
							{ site.site_icon && <Favicon site={ site } size={ 48 } /> }
							{ ! site.site_icon && <Gravatar user={ post.author } size={ 48 } /> }
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
	return {
		post: actualPost,
		site: {
			URL: actualPost?.site_URL,
			site_icon: actualPost?.site_icon?.ico,
			blog_ID: actualPost?.site_ID,
			feed_ID: actualPost?.feed_ID,
			name: actualPost?.site_name,
			description: decodeEntities( actualPost?.site_description ),
		},
	};
} )( SuggestedFollowItem );
