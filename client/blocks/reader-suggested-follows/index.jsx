import './style.scss';
import { useTranslate } from 'i18n-calypso';
import React from 'react';
import { SiteIcon } from 'calypso/blocks/site-icon';
import FollowButton from 'calypso/reader/follow-button';
import { formatUrlForDisplay } from 'calypso/reader/lib/feed-display-helper';
import { getStreamUrl } from 'calypso/reader/route';
import { recordAction, recordGaEvent } from 'calypso/reader/stats';
import { useDispatch } from 'calypso/state';
import { successNotice } from 'calypso/state/notices/actions';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';

export const SuggestedFollowItem = ( { site, followSource } ) => {
	const dispatch = useDispatch();
	const translate = useTranslate();

	const streamUrl = getStreamUrl( site?.feed_ID, site?.blog_ID );
	const urlForDisplay = site && site.URL ? formatUrlForDisplay( site.URL ) : '';

	const onFollowToggle = ( isFollowing ) => {
		const displayName = site.name || urlForDisplay;

		dispatch(
			successNotice(
				isFollowing
					? translate( 'Success! You are now subscribed to %s.', { args: displayName } )
					: translate( 'Success! You are now unsubscribed from "%s".', { args: displayName } ),
				{ duration: 2000 }
			)
		);
	};

	const onSiteClick = ( selectedSite ) => {
		recordAction( 'clicked_reader_suggested_following_item' );
		recordGaEvent( 'Clicked Reader Suggested Following Item' );
		dispatch(
			recordReaderTracksEvent( 'calypso_reader_suggested_following_item_clicked', {
				blog: decodeURIComponent( selectedSite.URL ),
			} )
		);
	};

	/* eslint-disable wpcalypso/jsx-classname-namespace */
	return (
		<div className="reader-suggested-follow-item">
			{ site && (
				<>
					<a
						className="reader-suggested-follow-item_link"
						href={ streamUrl }
						onClick={ () => onSiteClick( site ) }
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
						<FollowButton
							siteUrl={ site.URL }
							followSource={ followSource }
							onFollowToggle={ onFollowToggle }
						/>
					</span>
				</>
			) }
		</div>
	);
	/* eslint-enable wpcalypso/jsx-classname-namespace */
};

export default SuggestedFollowItem;
