import { Gridicon } from '@automattic/components';
import { Reader, SubscriptionManager } from '@automattic/data-stores';
import { __experimentalHStack as HStack } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useMemo, useRef } from 'react';
import { connect, useDispatch } from 'react-redux';
import ExternalLink from 'calypso/components/external-link';
import InfoPopover from 'calypso/components/info-popover';
import TimeSince from 'calypso/components/time-since';
import {
	useRecordSiteUnsubscribed,
	useRecordSiteResubscribed,
	useRecordSiteIconClicked,
	useRecordSiteTitleClicked,
	useRecordSiteUrlClicked,
	useRecordNotificationsToggle,
	useRecordPostEmailsToggle,
	useRecordCommentEmailsToggle,
	useRecordPostEmailsSetFrequency,
	SOURCE_SUBSCRIPTIONS_SITE_LIST,
	SOURCE_SUBSCRIPTIONS_UNSUBSCRIBED_NOTICE,
} from 'calypso/landing/subscriptions/tracks';
import { successNotice } from 'calypso/state/notices/actions';
import { Link } from '../link';
import { SiteSettingsPopover } from '../settings';
import { SiteIcon } from '../site-icon';
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

type SiteRowProps = Reader.SiteSubscription & {
	successNotice: typeof successNotice;
};

const SiteRow = ( {
	blog_ID: blog_id,
	feed_ID: feed_id,
	name,
	site_icon,
	URL: url,
	date_subscribed,
	delivery_methods,
	is_wpforteams_site,
	is_paid_subscription,
	isDeleted,
	successNotice,
}: SiteRowProps ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const unsubscribeInProgress = useRef( false );
	const resubscribePending = useRef( false );

	const hostname = useMemo( () => {
		try {
			return new URL( url ).hostname;
		} catch ( e ) {
			return '';
		}
	}, [ url ] );
	const { isLoggedIn } = SubscriptionManager.useIsLoggedIn();
	const deliveryFrequencyLabel = useDeliveryFrequencyLabel(
		delivery_methods.email?.post_delivery_frequency
	);
	const { mutate: updateNotifyMeOfNewPosts, isLoading: updatingNotifyMeOfNewPosts } =
		SubscriptionManager.useSiteNotifyMeOfNewPostsMutation();
	const { mutate: updateEmailMeNewPosts, isLoading: updatingEmailMeNewPosts } =
		SubscriptionManager.useSiteEmailMeNewPostsMutation();
	const { mutate: updateDeliveryFrequency, isLoading: updatingFrequency } =
		SubscriptionManager.useSiteDeliveryFrequencyMutation();
	const { mutate: updateEmailMeNewComments, isLoading: updatingEmailMeNewComments } =
		SubscriptionManager.useSiteEmailMeNewCommentsMutation();
	const { mutate: unsubscribe, isLoading: unsubscribing } =
		SubscriptionManager.useSiteUnsubscribeMutation();
	const { mutate: resubscribe } = SubscriptionManager.useSiteSubscribeMutation();

	// Tracks events recording
	const recordSiteIconClicked = useRecordSiteIconClicked();
	const recordSiteTitleClicked = useRecordSiteTitleClicked();
	const recordSiteUrlClicked = useRecordSiteUrlClicked();
	const recordNotificationsToggle = useRecordNotificationsToggle();
	const recordPostEmailsToggle = useRecordPostEmailsToggle();
	const recordCommentEmailsToggle = useRecordCommentEmailsToggle();
	const recordPostEmailsSetFrequency = useRecordPostEmailsSetFrequency();
	const recordSiteUnsubscribed = useRecordSiteUnsubscribed();
	const recordSiteResubscribed = useRecordSiteResubscribed();

	const unsubscribeCallback = () => {
		recordSiteUnsubscribed( { blog_id, url, source: SOURCE_SUBSCRIPTIONS_SITE_LIST } );
		dispatch(
			successNotice(
				translate( 'You have successfully unsubscribed from %(name)s.', { args: { name } } ),
				{
					duration: 5000,
					button: translate( 'Resubscribe' ),
					onClick: () => {
						if ( unsubscribeInProgress.current ) {
							resubscribePending.current = true;
						} else {
							resubscribe( { blog_id, url, doNotInvalidateSiteSubscriptions: true } );
							recordSiteResubscribed( {
								blog_id,
								url,
								source: SOURCE_SUBSCRIPTIONS_UNSUBSCRIBED_NOTICE,
							} );
						}
					},
				}
			)
		);
	};

	const { isReaderPortal, isSubscriptionsPortal } = useSubscriptionManagerContext();

	const siteTitleUrl = useMemo( () => {
		if ( isReaderPortal ) {
			return `/read/feeds/${ feed_id }`;
		}

		if ( isSubscriptionsPortal ) {
			return `/subscriptions/site/${ blog_id }`;
		}
	}, [ blog_id, feed_id, isReaderPortal, isSubscriptionsPortal ] );

	const handleNotifyMeOfNewPostsChange = ( send_posts: boolean ) => {
		// Update post notification settings
		updateNotifyMeOfNewPosts( { blog_id, send_posts } );

		// Record tracks event
		recordNotificationsToggle( send_posts, { blog_id } );
	};

	const handleEmailMeNewPostsChange = ( send_posts: boolean ) => {
		// Update post emails settings
		updateEmailMeNewPosts( { blog_id, send_posts } );

		// Record tracks event
		recordPostEmailsToggle( send_posts, { blog_id } );
	};

	const handleEmailMeNewCommentsChange = ( send_comments: boolean ) => {
		// Update comment emails settings
		updateEmailMeNewComments( { blog_id, send_comments } );

		// Record tracks event
		recordCommentEmailsToggle( send_comments, { blog_id } );
	};

	const handleDeliveryFrequencyChange = ( delivery_frequency: Reader.EmailDeliveryFrequency ) => {
		// Update post emails delivery frequency
		updateDeliveryFrequency( { blog_id, delivery_frequency } );

		// Record tracks event
		recordPostEmailsSetFrequency( { blog_id, delivery_frequency } );
	};

	return ! isDeleted ? (
		<HStack as="li" alignItems="center" className="row" role="row">
			<span className="title-cell" role="cell">
				<Link
					className="title-icon"
					href={ siteTitleUrl }
					onClick={ () => {
						recordSiteIconClicked( { blog_id, feed_id, source: SOURCE_SUBSCRIPTIONS_SITE_LIST } );
					} }
				>
					<SiteIcon iconUrl={ site_icon } size={ 40 } siteName={ name } />
				</Link>
				<span className="title-column">
					<Link
						className="title-name"
						href={ siteTitleUrl }
						onClick={ () => {
							recordSiteTitleClicked( {
								blog_id,
								feed_id,
								source: SOURCE_SUBSCRIPTIONS_SITE_LIST,
							} );
						} }
					>
						{ name }
						{ !! is_wpforteams_site && <span className="p2-label">P2</span> }
						{ !! is_paid_subscription && (
							<span className="paid-label">
								{ translate( 'Paid', { context: 'Label for a paid subscription plan' } ) }
							</span>
						) }
					</Link>
					<ExternalLink
						className="title-url"
						{ ...( url && { href: url } ) }
						rel="noreferrer noopener"
						target="_blank"
						onClick={ () => {
							recordSiteUrlClicked( { blog_id, feed_id, source: SOURCE_SUBSCRIPTIONS_SITE_LIST } );
						} }
					>
						{ hostname }
					</ExternalLink>
				</span>
			</span>
			<span className="date-cell" role="cell">
				<TimeSince
					date={
						( date_subscribed.valueOf() ? date_subscribed : new Date( 0 ) ).toISOString?.() ??
						date_subscribed
					}
				/>
			</span>
			{ isLoggedIn && (
				<span className="new-posts-cell" role="cell">
					<SelectedNewPostDeliveryMethods
						isEmailMeNewPostsSelected={ !! delivery_methods.email?.send_posts }
						isNotifyMeOfNewPostsSelected={ !! delivery_methods.notification?.send_posts }
					/>
				</span>
			) }
			{ isLoggedIn && (
				<span className="new-comments-cell" role="cell">
					<InfoPopover
						position="top"
						icon={ ! delivery_methods.email?.send_comments ? 'cross' : 'checkmark' }
						iconSize={ 16 }
						className={ ! delivery_methods.email?.send_comments ? 'red' : 'green' }
						showOnHover={ true }
					>
						{ delivery_methods.email?.send_comments
							? translate( 'You will receive emails notifications for new comments on this site.' )
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
					// NotifyMeOfNewPosts
					notifyMeOfNewPosts={ !! delivery_methods.notification?.send_posts }
					onNotifyMeOfNewPostsChange={ handleNotifyMeOfNewPostsChange }
					updatingNotifyMeOfNewPosts={ updatingNotifyMeOfNewPosts }
					// EmailMeNewPosts
					emailMeNewPosts={ !! delivery_methods.email?.send_posts }
					updatingEmailMeNewPosts={ updatingEmailMeNewPosts }
					onEmailMeNewPostsChange={ handleEmailMeNewPostsChange }
					// DeliveryFrequency
					deliveryFrequency={
						delivery_methods.email?.post_delivery_frequency ??
						Reader.EmailDeliveryFrequency.Instantly
					}
					onDeliveryFrequencyChange={ handleDeliveryFrequencyChange }
					updatingFrequency={ updatingFrequency }
					// EmailMeNewComments
					emailMeNewComments={ !! delivery_methods.email?.send_comments }
					onEmailMeNewCommentsChange={ handleEmailMeNewCommentsChange }
					updatingEmailMeNewComments={ updatingEmailMeNewComments }
					onUnsubscribe={ () => {
						unsubscribeInProgress.current = true;
						unsubscribeCallback();
						unsubscribe(
							{ blog_id, url, doNotInvalidateSiteSubscriptions: true },
							{
								onSuccess: () => {
									unsubscribeInProgress.current = false;

									if ( resubscribePending.current ) {
										resubscribePending.current = false;
										resubscribe( { blog_id, url, doNotInvalidateSiteSubscriptions: true } );
										recordSiteResubscribed( {
											blog_id,
											url,
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
	) : null;
};

export default connect( null, { successNotice } )( SiteRow );
