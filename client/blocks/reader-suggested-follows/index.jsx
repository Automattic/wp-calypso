import './style.scss';
import React from 'react';
import { SiteIcon } from 'calypso/blocks/site-icon';
import FollowButton from 'calypso/reader/follow-button';
import { formatUrlForDisplay } from 'calypso/reader/lib/feed-display-helper';
import { getStreamUrl } from 'calypso/reader/route';
import { recordAction, recordGaEvent } from 'calypso/reader/stats';
import { useDispatch } from 'calypso/state';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';

export const SuggestedFollowItem = ( { site, followSource } ) => {
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

	const streamUrl = getStreamUrl( site?.feed_ID, site?.blog_ID );
	const urlForDisplay = site && site.URL ? formatUrlForDisplay( site.URL ) : '';

	/* eslint-disable wpcalypso/jsx-classname-namespace */
	return (
		<div className="reader-suggested-follow-item">
			{ site && (
				<>
					<a
						className="reader-suggested-follow-item_link"
						href={ streamUrl }
						onClick={ () => onSiteClick( site ) }
						aria-hidden="true"
						target="_blank"
						rel="noreferrer"
					>
						<span>
							<SiteIcon iconUrl={ site.site_icon } size={ 48 } />
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
						<FollowButton siteUrl={ site.URL } followSource={ followSource } />
					</span>
				</>
			) }
		</div>
	);
	/* eslint-enable wpcalypso/jsx-classname-namespace */
};

export default SuggestedFollowItem;
