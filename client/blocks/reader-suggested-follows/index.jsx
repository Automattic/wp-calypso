import React from 'react';
import { useDispatch } from 'react-redux';
import Gravatar from 'calypso/components/gravatar';
import Favicon from 'calypso/reader/components/favicon';
import ReaderFollowFeedIcon from 'calypso/reader/components/icons/follow-feed-icon';
import ReaderFollowingFeedIcon from 'calypso/reader/components/icons/following-feed-icon';
import FollowButton from 'calypso/reader/follow-button';
import { formatUrlForDisplay } from 'calypso/reader/lib/feed-display-helper';
import { recordAction, recordGaEvent } from 'calypso/reader/stats';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import './style.scss';

const SuggestedFollowItem = ( { site, followSource } ) => {
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
		streamLink = `/reader/feeds/${ site.feed_ID }`;
	} else if ( site && site.blog_ID ) {
		// If subscription is missing a feed ID, fallback to blog stream
		streamLink = `/reader/blogs/${ site.blog_ID }`;
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
						target="_blank"
						rel="noreferrer"
					>
						<span className="reader-suggested-follow-item_siteicon">
							{ site.site_icon && <Favicon site={ site } size={ 48 } /> }
							{ ! site.site_icon && site.post_author && (
								<Gravatar user={ site.post_author } size={ 48 } />
							) }
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
							followIcon={ ReaderFollowFeedIcon( { iconSize: 20 } ) }
							followingIcon={ ReaderFollowingFeedIcon( { iconSize: 20 } ) }
							followSource={ followSource }
						/>
					</span>
				</>
			) }
		</div>
	);
	/* eslint-enable wpcalypso/jsx-classname-namespace */
};

export default SuggestedFollowItem;
