import { filterURLForDisplay } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import ReaderAvatar from 'calypso/blocks/reader-avatar';
import AutoDirection from 'calypso/components/auto-direction';
import QueryReaderSite from 'calypso/components/data/query-reader-site';
import { FeedRecommendation } from 'calypso/data/reader/use-feed-recommendations-query';
import ReaderFollowButton from 'calypso/reader/follow-button';
import { useSelector, useDispatch } from 'calypso/state';
import { successNotice } from 'calypso/state/notices/actions';
import { getSite } from 'calypso/state/reader/sites/selectors';
import type { SiteDetails } from '@automattic/data-stores';

interface RecommendedFeedItemProps {
	feed: FeedRecommendation;
	variant: 'card' | 'compact' | 'default';
	followSource: string;
}

export function RecommendedFeedItem( {
	feed,
	variant,
	followSource,
}: RecommendedFeedItemProps ): JSX.Element {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const { image, name, feedUrl = '', siteId, feedId } = feed;
	const site = useSelector( ( state ) => getSite( state, Number( siteId ) ) ) as SiteDetails;
	const siteIcon = site?.icon?.img || site?.icon?.ico || image;
	const isCompactView = variant === 'compact';

	let linkUrl = feedUrl;
	if ( feedId ) {
		linkUrl = `/reader/feeds/${ feedId }`;
	} else if ( siteId ) {
		linkUrl = `/reader/blogs/${ siteId }`;
	}

	function onFollowToggle( isFollowing: boolean ): void {
		const displayName: string = name || filterURLForDisplay( feedUrl ?? '' );

		dispatch(
			successNotice(
				isFollowing
					? translate( 'Success! You are now subscribed to %s.', { args: displayName } )
					: translate( 'Success! You are now unsubscribed from "%s".', { args: displayName } ),
				{ duration: 2000 }
			)
		);
	}

	return (
		<li className="recommended-feed-item">
			{ /* Query the site not just for the icon, but to ensure it is properly loaded in follows state.
				One example being mapped domains: initial follows state may list by wpcom subdomain, and
				the url here might be of a mapped domain. The site request success also updates follows
				state, and can bridge the gap to appropriately determine if a site from this list is
				followed.
			*/ }
			<QueryReaderSite siteId={ siteId } />

			<a className="recommended-feed-item__link" href={ linkUrl }>
				<ReaderAvatar
					isCompact={ isCompactView }
					siteIcon={ siteIcon }
					iconSize={ variant === 'default' ? 48 : 30 }
					className="recommended-feed-icon"
				/>

				<AutoDirection>
					<div className="recommended-feed-info">
						<h3>{ name || feedUrl }</h3>
						{ ! isCompactView && <p>{ site?.description || translate( 'No description.' ) }</p> }
					</div>
				</AutoDirection>
			</a>

			{ feedUrl && (
				<ReaderFollowButton
					className="recommended-feed-subscribe-button"
					feedId={ feedId ? Number( feedId ) : undefined }
					siteId={ siteId ? Number( siteId ) : undefined }
					siteUrl={ feedUrl }
					followSource={ followSource }
					isButtonOnly={ isCompactView }
					onFollowToggle={ onFollowToggle }
				/>
			) }
		</li>
	);
}
