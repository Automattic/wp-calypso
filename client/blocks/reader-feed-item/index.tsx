import { recordTrainTracksInteract } from '@automattic/calypso-analytics';
import { ExternalLink } from '@automattic/components';
import { Reader, SubscriptionManager } from '@automattic/data-stores';
import {
	Button,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { rss } from '@wordpress/icons';
import { filterURLForDisplay } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { useSelector, useDispatch } from 'react-redux';
import { SiteIcon } from 'calypso/blocks/site-icon';
import {
	SOURCE_SUBSCRIPTIONS_SEARCH_RECOMMENDATION_LIST,
	useRecordSiteSubscribed,
	useRecordSiteUnsubscribed,
	useRecordSiteIconClicked,
	useRecordSiteTitleClicked,
	useRecordSiteUrlClicked,
} from 'calypso/landing/subscriptions/tracks';
import { getSiteName, getSiteUrl } from 'calypso/reader/get-helpers';
import { getFeedUrl } from 'calypso/reader/route';
import { isCurrentUserEmailVerified } from 'calypso/state/current-user/selectors';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { NoticeOptions } from 'calypso/state/notices/types';
import './style.scss';

interface ReaderFeedItemProps {
	feed: Reader.FeedItem;
	source: string; // Indicates where the feed item is rendered.
	shouldHideOnSubscribedState?: boolean; // To not render anything if the feed is in subscribed state.
	onChangeSubscribe?: ( subscribed: boolean ) => void;
}

/**
 * A component that renders a single feed item row. This includes both wpcom and non-wpcom feeds.
 */
export default function ReaderFeedItem( props: ReaderFeedItemProps ): JSX.Element | null {
	const {
		feed: {
			blog_ID: blogId = null,
			feed_ID: feedId,
			subscribe_URL: subscribeUrl, // For non-wpcom feeds, use the subscribe URL as it's available in all cases even for new feeds.
			railcar,
		},
		source,
		shouldHideOnSubscribedState,
		onChangeSubscribe,
	} = props;
	const isWpcomFeed = !! blogId;
	const translate = useTranslate();
	const isEmailVerified = useSelector( isCurrentUserEmailVerified );
	const dispatch = useDispatch();
	const { isPending: isSubscribing, mutate: onSubscribe } =
		SubscriptionManager.useSiteSubscribeMutation();
	const { isPending: isUnsubscribing, mutate: onUnsubscribe } =
		SubscriptionManager.useSiteUnsubscribeMutation();

	// Hook for tracking.
	const recordSiteIconClicked = useRecordSiteIconClicked();
	const recordSiteTitleClicked = useRecordSiteTitleClicked();
	const recordSiteUrlClicked = useRecordSiteUrlClicked();
	const recordSiteSubscribed = useRecordSiteSubscribed();
	const recordSiteUnsubscribed = useRecordSiteUnsubscribed();

	// Fetch feed and site data.
	const queryFeed: boolean = ! isWpcomFeed; // No need to query feed data for WPCOM feeds.
	const { data: feed, isLoading: isFeedLoading } = Reader.useReadFeedQuery( queryFeed, feedId );
	const { data: site, isLoading: isSiteLoading } = Reader.useReadFeedSiteQuery( Number( blogId ) );

	if ( isFeedLoading || ( isWpcomFeed && isSiteLoading ) ) {
		return null;
	}

	// Reader feed item fields to show in the UI.
	const description = isWpcomFeed ? site?.description : feed?.description;
	const displayUrl = isWpcomFeed && site ? getSiteUrl( { feed, site } ) : subscribeUrl;
	const filteredDisplayUrl = filterURLForDisplay( displayUrl ?? '' );
	const feedUrl = isWpcomFeed ? getFeedUrl( feed?.feed_ID ) : subscribeUrl;
	const subscriptionId = feed?.subscription_id;
	const iconUrl = isWpcomFeed ? site?.icon?.img ?? site?.icon?.ico : feed?.image;
	const shouldTrackRecommendedSearch =
		source === SOURCE_SUBSCRIPTIONS_SEARCH_RECOMMENDATION_LIST && railcar;
	const title =
		isWpcomFeed && site
			? getSiteName( { feed, site } )
			: feed?.name ?? filterURLForDisplay( subscribeUrl );

	function onSubscribeToggle(): void {
		if ( ! isEmailVerified ) {
			dispatch(
				errorNotice( translate( 'Please verify your email before subscribing.' ), {
					id: 'resend-verification-email',
					button: translate( 'Account Settings' ),
					href: '/me/account',
				} )
			);

			return;
		}

		const noticeOptions: NoticeOptions = { duration: 5000 };
		if ( subscriptionId ) {
			onUnsubscribe( {
				subscriptionId: subscriptionId,
				blog_id: blogId ?? undefined,
				url: subscribeUrl,
				onSuccess: () => {
					dispatch(
						successNotice(
							translate( 'Success! You are now unsubscribed to "%s".', {
								args: title ?? filteredDisplayUrl,
							} ),
							noticeOptions
						)
					);

					recordSiteUnsubscribed( { blog_id: blogId, url: subscribeUrl, source } );
					onChangeSubscribe?.( false );

					if ( shouldTrackRecommendedSearch ) {
						// reader: action: site_followed, railcar, ui_algo, ui_position, fetch_algo, fetch_position, fetch_lang, rec_blog_id, (incorrect: only railcar & action accepted)
						// subscriptions: action: recommended_search_item_site_subscribed, railcar
						recordTrainTracksInteract( {
							railcarId: railcar.railcar,
							action: 'recommended_search_item_site_unsubscribed',
						} );
					}
				},
				onError: () => {
					dispatch(
						errorNotice(
							translate( 'Sorry, we had a problem unsubscribing. Please try again.' ),
							noticeOptions
						)
					);
				},
			} );
		} else {
			onSubscribe( {
				blog_id: blogId ?? undefined,
				feed_id: feedId,
				url: subscribeUrl,
				onSuccess: () => {
					dispatch(
						successNotice(
							translate( 'Success! You are now subscribed to %s.', { args: filteredDisplayUrl } ),
							noticeOptions
						)
					);

					onChangeSubscribe?.( true );
					recordSiteSubscribed( { blog_id: blogId, url: subscribeUrl, source } );

					if ( railcar ) {
						// reader: action: site_followed, railcar, ui_algo, ui_position, fetch_algo, fetch_position, fetch_lang, rec_blog_id, (incorrect: only railcar & action accepted)
						// subscriptions: action: recommended_search_item_site_subscribed, railcar
						recordTrainTracksInteract( {
							railcarId: railcar.railcar,
							action: 'recommended_search_item_site_subscribed',
						} );
					}
				},
				onError: () => {
					dispatch(
						errorNotice(
							translate( 'Sorry, we had a problem subscribing. Please try again.' ),
							noticeOptions
						)
					);
				},
			} );
		}
	}

	function onTitleClick(): void {
		recordSiteTitleClicked( { blog_id: blogId, feed_id: feedId, source } );

		if ( shouldTrackRecommendedSearch ) {
			// reader: action: feed_link_clicked, railcar, ui_algo, ui_position, fetch_algo, fetch_position, fetch_lang, rec_blog_id, (incorrect: only railcar & action accepted)
			// subscriptions: action: recommended_search_item_site_title_click, railcar
			recordTrainTracksInteract( {
				railcarId: railcar.railcar,
				action: 'recommended_search_item_site_title_click',
			} );
		}
	}

	function onIconClick(): void {
		recordSiteIconClicked( { blog_id: blogId, feed_id: feedId, source } );

		if ( shouldTrackRecommendedSearch ) {
			// reader: action: avatar_click, railcar, ui_algo, ui_position, fetch_algo, fetch_position, fetch_lang, rec_blog_id, (incorrect: only railcar & action accepted)
			// subscriptions: action: recommended_search_item_site_icon_click, railcar
			recordTrainTracksInteract( {
				railcarId: railcar.railcar,
				action: 'recommended_search_item_site_icon_click',
			} );
		}
	}

	function onDisplayUrlClick(): void {
		recordSiteUrlClicked( { blog_id: blogId, feed_id: feedId, source } );

		if ( shouldTrackRecommendedSearch ) {
			// reader: action: site_url_clicked, railcar, ui_algo, ui_position, fetch_algo, fetch_position, fetch_lang, rec_blog_id, (incorrect: only railcar & action accepted)
			// subscriptions: action: recommended_search_item_site_icon_click, railcar
			recordTrainTracksInteract( {
				railcarId: railcar.railcar,
				action: 'recommended_search_item_site_url_click',
			} );
		}
	}

	const SubscribeButton = (): JSX.Element => (
		<Button
			variant={ subscriptionId ? 'secondary' : 'primary' }
			isBusy={ isSubscribing || isUnsubscribing }
			disabled={ isSubscribing || isUnsubscribing }
			onClick={ onSubscribeToggle }
			__next40pxDefaultSize
		>
			{ subscriptionId ? translate( 'Unsubscribe' ) : translate( 'Subscribe' ) }
		</Button>
	);

	if ( subscriptionId && shouldHideOnSubscribedState ) {
		return null;
	}

	return (
		<HStack as="li" className="reader-feed-item" alignment="center" spacing={ 8 }>
			<VStack className="reader-feed-item__site-preview-v-stack">
				<HStack>
					<HStack className="reader-feed-item__site-preview-h-stack" spacing={ 3 }>
						{ ! isWpcomFeed ? (
							<ExternalLink
								className="reader-feed-item__icon"
								href={ feedUrl }
								onClick={ onIconClick }
								target="_blank"
							>
								<SiteIcon iconUrl={ iconUrl } defaultIcon={ rss } size={ 40 } />
							</ExternalLink>
						) : (
							<a className="reader-feed-item__icon" href={ feedUrl } onClick={ onIconClick }>
								<SiteIcon iconUrl={ iconUrl } defaultIcon={ rss } size={ 40 } />
							</a>
						) }
						<VStack className="reader-feed-item__title-with-url-v-stack" spacing={ 0 }>
							{ ! isWpcomFeed ? (
								<ExternalLink
									className="reader-feed-item__title"
									href={ feedUrl }
									target="_blank"
									onClick={ onTitleClick }
								>
									{ title ? title : filteredDisplayUrl }
								</ExternalLink>
							) : (
								<a className="reader-feed-item__title" href={ feedUrl } onClick={ onTitleClick }>
									{ title ? title : filteredDisplayUrl }
								</a>
							) }
							<ExternalLink
								className="reader-feed-item__url"
								href={ displayUrl }
								target="_blank"
								onClick={ onDisplayUrlClick }
							>
								{ filteredDisplayUrl }
							</ExternalLink>
						</VStack>
					</HStack>
					<div className="reader-feed-item__description">{ description }</div>

					<div className="reader-feed-item__subscribe-button">
						<SubscribeButton />
					</div>
				</HStack>
				<div className="reader-feed-item__mobile-description" aria-hidden="true">
					{ description }
				</div>
				<div className="reader-feed-item__mobile-subscribe-button">
					<SubscribeButton />
				</div>
			</VStack>
		</HStack>
	);
}
