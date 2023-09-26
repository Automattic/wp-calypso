import { Gridicon } from '@automattic/components';
import { Reader, SubscriptionManager } from '@automattic/data-stores';
import { __experimentalHStack as HStack } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useMemo, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { SiteIcon } from 'calypso/blocks/site-icon';
import ExternalLink from 'calypso/components/external-link';
import InfoPopover from 'calypso/components/info-popover';
import TimeSince from 'calypso/components/time-since';
import {
	useRecordSiteUnsubscribed,
	useRecordSiteResubscribed,
	useRecordSiteIconClicked,
	useRecordSiteTitleClicked,
	useRecordSiteUrlClicked,
	SOURCE_SUBSCRIPTIONS_SITE_LIST,
	SOURCE_SUBSCRIPTIONS_UNSUBSCRIBED_NOTICE,
} from 'calypso/landing/subscriptions/tracks';
import { useSiteSubscription } from 'calypso/reader/contexts/SiteSubscriptionContext';
import { successNotice } from 'calypso/state/notices/actions';
import { Link } from '../link';
import { SiteSettingsPopover } from '../settings';
import { useSubscriptionManagerContext } from '../subscription-manager-context';

const useDeliveryFrequencyLabel = ( deliveryFrequencyValue?: Reader.EmailDeliveryFrequency ) => {
	const translate = useTranslate();

	const deliveryFrequencyLabels = useMemo(
		() => ( {
			daily: translate( 'Daily' ),
			weekly: translate( 'Weekly' ),
			instantly: translate( 'Instantly' ),
		} ),
		[ translate ]
	);

	return (
		deliveryFrequencyLabels[ deliveryFrequencyValue as Reader.EmailDeliveryFrequency ] ??
		translate( 'Paused' )
	);
};

const SelectedNewPostDeliveryMethods = ( {
	isEmailMeNewPostsSelected,
	isNotifyMeOfNewPostsSelected,
}: {
	isEmailMeNewPostsSelected: boolean;
	isNotifyMeOfNewPostsSelected: boolean;
} ) => {
	const translate = useTranslate();

	if ( ! isEmailMeNewPostsSelected && ! isNotifyMeOfNewPostsSelected ) {
		return <Gridicon icon="cross" size={ 16 } className="red" />;
	}

	const emailDelivery = isEmailMeNewPostsSelected ? translate( 'Email' ) : null;
	const notificationDelivery = isNotifyMeOfNewPostsSelected ? translate( 'Notifications' ) : null;
	const selectedNewPostDeliveryMethods = [ emailDelivery, notificationDelivery ]
		.filter( Boolean )
		.join( ', ' );
	return <>{ selectedNewPostDeliveryMethods }</>;
};

const SiteSubscriptionRow = () => {
	const { data: subscription } = useSiteSubscription();
	if ( subscription === undefined ) {
		throw new Error( 'SiteSubscriptionRow: site subscription data is undefined' );
	}

	const translate = useTranslate();
	const dispatch = useDispatch();

	const unsubscribeInProgress = useRef( false );
	const resubscribePending = useRef( false );

	const hostname = useMemo( () => {
		try {
			return new URL( subscription.url ).hostname;
		} catch ( e ) {
			return '';
		}
	}, [ subscription.url ] );
	const { isLoggedIn } = SubscriptionManager.useIsLoggedIn();
	const deliveryFrequencyLabel = useDeliveryFrequencyLabel(
		subscription.deliveryMethods.email?.postDeliverFrequency
	);

	const { mutate: unsubscribe, isLoading: unsubscribing } =
		SubscriptionManager.useSiteUnsubscribeMutation();
	const { mutate: resubscribe } = SubscriptionManager.useSiteSubscribeMutation();

	// Tracks events recording
	const recordSiteIconClicked = useRecordSiteIconClicked();
	const recordSiteTitleClicked = useRecordSiteTitleClicked();
	const recordSiteUrlClicked = useRecordSiteUrlClicked();
	const recordSiteUnsubscribed = useRecordSiteUnsubscribed();
	const recordSiteResubscribed = useRecordSiteResubscribed();

	const unsubscribeCallback = () => {
		recordSiteUnsubscribed( {
			blog_id: String( subscription.blogId ),
			url: subscription.url,
			source: SOURCE_SUBSCRIPTIONS_SITE_LIST,
		} );
		dispatch(
			successNotice(
				translate( 'You have successfully unsubscribed from %(name)s.', {
					args: { name: subscription.name },
				} ),
				{
					duration: 5000,
					button: translate( 'Resubscribe' ),
					onClick: () => {
						if ( unsubscribeInProgress.current ) {
							resubscribePending.current = true;
						} else {
							resubscribe( {
								blogId: subscription.blogId,
								url: subscription.url,
								doNotInvalidateSiteSubscriptions: true,
							} );
							recordSiteResubscribed( {
								blog_id: String( subscription.blogId ),
								url: subscription.url,
								source: SOURCE_SUBSCRIPTIONS_UNSUBSCRIBED_NOTICE,
							} );
						}
					},
				}
			)
		);
	};

	const { isReaderPortal, isSubscriptionsPortal } = useSubscriptionManagerContext();
	const emailMeNewPostsEnabled = Boolean( subscription.deliveryMethods.email?.sendPosts );
	const notifyMeOfNewPostsEnabled = Boolean( subscription.deliveryMethods.notification?.sendPosts );
	const notifyMeOfNewCommentsEnabled = Boolean( subscription.deliveryMethods.email?.sendComments );

	const siteTitleUrl = useMemo( () => {
		if ( isReaderPortal ) {
			const feedUrl = `/read/feeds/${ subscription.feedId }`;

			if ( ! subscription.blogId ) {
				// The site subscription page does not support non-wpcom feeds yet
				return feedUrl;
			}

			return `/read/subscriptions/${ subscription.id }`;
		}

		if ( isSubscriptionsPortal ) {
			if ( ! Reader.isValidId( subscription.blogId ) ) {
				// If it is a non-wpcom feed item, we want to open the reader's page for that feed
				return `/read/feeds/${ subscription.feedId }`;
			}
			return `/subscriptions/site/${ subscription.blogId }`;
		}
	}, [
		isReaderPortal,
		isSubscriptionsPortal,
		subscription.blogId,
		subscription.feedId,
		subscription.id,
	] );

	if ( subscription.isDeleted ) {
		return null;
	}

	return (
		<HStack as="li" alignment="center" className="row" role="row">
			<span className="title-cell" role="cell">
				<Link
					className="title-icon"
					href={ siteTitleUrl }
					onClick={ () => {
						recordSiteIconClicked( {
							blog_id: String( subscription.blogId ),
							feed_id:
								typeof subscription.feedId === 'number' ? String( subscription.feedId ) : undefined,
							source: SOURCE_SUBSCRIPTIONS_SITE_LIST,
						} );
					} }
				>
					<SiteIcon iconUrl={ subscription.siteIcon } size={ 40 } alt={ subscription.name } />
				</Link>
				<span className="title-column">
					<Link
						className="title-name"
						href={ siteTitleUrl }
						onClick={ () => {
							recordSiteTitleClicked( {
								blog_id: String( subscription.blogId ),
								feed_id:
									typeof subscription.feedId === 'number'
										? String( subscription.feedId )
										: undefined,
								source: SOURCE_SUBSCRIPTIONS_SITE_LIST,
							} );
						} }
					>
						{ subscription.name }
						{ !! subscription.isWpForTeamsSite && <span className="p2-label">P2</span> }
						{ !! subscription.isPaidSubscription && (
							<span className="paid-label">
								{ translate( 'Paid', { context: 'Label for a paid subscription plan' } ) }
							</span>
						) }
					</Link>
					<ExternalLink
						className="title-url"
						{ ...( subscription.url && { href: subscription.url } ) }
						rel="noreferrer noopener"
						target="_blank"
						onClick={ () => {
							recordSiteUrlClicked( {
								blog_id: String( subscription.blogId ),
								feed_id:
									typeof subscription.feedId === 'number'
										? String( subscription.feedId )
										: undefined,
								source: SOURCE_SUBSCRIPTIONS_SITE_LIST,
							} );
						} }
					>
						{ hostname }
					</ExternalLink>
				</span>
			</span>
			<span className="date-cell" role="cell">
				<TimeSince
					date={
						( subscription.dateSubscribed.valueOf()
							? subscription.dateSubscribed
							: new Date( 0 )
						).toISOString?.() ?? subscription.dateSubscribed
					}
				/>
			</span>
			{ isLoggedIn && (
				<span className="new-posts-cell" role="cell">
					<SelectedNewPostDeliveryMethods
						isEmailMeNewPostsSelected={ emailMeNewPostsEnabled }
						isNotifyMeOfNewPostsSelected={ notifyMeOfNewPostsEnabled }
					/>
				</span>
			) }
			{ isLoggedIn && (
				<span className="new-comments-cell" role="cell">
					<InfoPopover
						position="top"
						icon={ notifyMeOfNewCommentsEnabled ? 'checkmark' : 'cross' }
						iconSize={ 16 }
						className={ notifyMeOfNewCommentsEnabled ? 'green' : 'red' }
						showOnHover={ true }
					>
						{ notifyMeOfNewCommentsEnabled
							? translate( 'You will receive email notifications for new comments on this site.' )
							: translate(
									"You won't receive email notifications for new comments on this site."
							  ) }
					</InfoPopover>
				</span>
			) }
			<span className="email-frequency-cell" role="cell">
				{ deliveryFrequencyLabel }
			</span>
			<span className="actions-cell" role="cell">
				<SiteSettingsPopover
					onUnsubscribe={ () => {
						unsubscribeInProgress.current = true;
						unsubscribeCallback();
						unsubscribe(
							{
								blogId: subscription.blogId,
								subscriptionId: Number( subscription.id ),
								url: subscription.url,
								doNotInvalidateSiteSubscriptions: true,
							},
							{
								onSuccess: () => {
									unsubscribeInProgress.current = false;

									if ( resubscribePending.current ) {
										resubscribePending.current = false;
										resubscribe( {
											blogId: subscription.blogId,
											url: subscription.url,
											doNotInvalidateSiteSubscriptions: true,
										} );
										recordSiteResubscribed( {
											blog_id: String( subscription.blogId ),
											url: subscription.url,
											source: SOURCE_SUBSCRIPTIONS_UNSUBSCRIBED_NOTICE,
										} );
									}
								},
							}
						);
					} }
					unsubscribing={ unsubscribing }
				/>
			</span>
		</HStack>
	);
};

export default SiteSubscriptionRow;
