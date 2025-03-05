import { Badge, TimeSince } from '@automattic/components';
import { SubscriptionManager, Reader } from '@automattic/data-stores';
import { useLocale } from '@automattic/i18n-utils';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useMemo, useState } from 'react';
import { SiteIcon } from 'calypso/blocks/site-icon';
import FormattedHeader from 'calypso/components/formatted-header';
import { Notice, NoticeState, NoticeType } from 'calypso/landing/subscriptions/components/notice';
import { useRecordViewFeedButtonClicked } from 'calypso/landing/subscriptions/tracks';
import { getQueryArgs } from 'calypso/lib/query-args';
import { getFeedUrl } from 'calypso/reader/route';
import CancelPaidSubscriptionModal from './cancel-paid-subscription-modal';
import {
	PaymentPlan,
	SiteSubscriptionDetailsProps,
	formatRenewalDate,
	formatRenewalPrice,
	getPaymentInterval,
} from './helpers';
import SiteSubscriptionSettings from './settings';
import SiteSubscriptionSubheader from './site-subscription-subheader';
import SubscribeToNewsletterCategories from './subscribe-to-newsletter-categories';
import './styles.scss';

const SiteSubscriptionDetails = ( {
	subscriptionId,
	subscriberCount,
	dateSubscribed,
	siteIcon,
	name,
	blogId,
	feedId,
	deliveryMethods,
	url,
	paymentDetails,
}: SiteSubscriptionDetailsProps ) => {
	const translate = useTranslate();
	const localeSlug = useLocale();
	const [ notice, setNotice ] = useState< NoticeState | null >( null );
	const [ showUnsubscribeModal, setShowUnsubscribeModal ] = useState( false );

	const {
		mutate: subscribe,
		isPending: subscribing,
		isSuccess: subscribed,
		error: subscribeError,
	} = SubscriptionManager.useSiteSubscribeMutation();
	const {
		mutate: unsubscribe,
		isPending: unsubscribing,
		isSuccess: unsubscribed,
		error: unsubscribeError,
	} = SubscriptionManager.useSiteUnsubscribeMutation();

	const [ paymentPlans, setPaymentPlans ] = useState< PaymentPlan[] >( [] );

	const [ siteSubscribed, setSiteSubscribed ] = useState( true );
	useEffect( () => {
		if ( subscribed ) {
			setSiteSubscribed( true );
		}
	}, [ subscribed ] );

	useEffect( () => {
		if ( unsubscribed ) {
			setSiteSubscribed( false );
		}
	}, [ unsubscribed ] );

	useEffect( () => {
		if ( paymentDetails ) {
			const newPaymentPlans: PaymentPlan[] = [];

			paymentDetails.forEach( ( paymentDetail: Reader.SiteSubscriptionPaymentDetails ) => {
				const { is_gift, ID, currency, renewal_price, renew_interval } = paymentDetail;
				const renewalPrice = formatRenewalPrice( renewal_price, currency );
				const when = getPaymentInterval( renew_interval );
				const renewalDate = formatRenewalDate( paymentDetail.end_date, localeSlug );
				newPaymentPlans.push( {
					is_gift: is_gift,
					id: ID,
					renewalPrice: `${ renewalPrice }${ when }`,
					renewalDate,
				} );
			} );

			setPaymentPlans( newPaymentPlans );
		}
	}, [ localeSlug, paymentDetails ] );

	const areAllPaymentsGifts = useMemo( () => {
		if ( paymentDetails && paymentDetails.length ) {
			for ( const plan in paymentPlans ) {
				if ( ! paymentPlans[ plan ].is_gift ) {
					return false;
				}
			}
			return true;
		}
		return false; // No payments
	}, [ paymentPlans ] );

	const onClickCancelSubscriptionButton = () => {
		if ( paymentPlans && !! paymentPlans.length ) {
			setShowUnsubscribeModal( true );
		} else {
			const emailId = getQueryArgs()?.email_id as string;
			unsubscribe( { blog_id: blogId, url, emailId, subscriptionId } );
		}
	};

	const onConfirmCancelSubscription = () => {
		window.open( '/me/purchases', '_blank' );
		setShowUnsubscribeModal( false );
	};

	useEffect( () => {
		// todo: style the button (underline, color?, etc.)
		const Resubscribe = () => (
			<Button
				onClick={ () => subscribe( { blog_id: blogId, url } ) }
				disabled={ subscribing || unsubscribing }
				variant="secondary"
			>
				{ translate( 'Resubscribe' ) }
			</Button>
		);

		if ( siteSubscribed ) {
			setNotice( null );
		}
		if ( ! siteSubscribed && ! subscribeError ) {
			setNotice( {
				type: NoticeType.Success,
				action: <Resubscribe />,
				message: translate(
					'You have successfully unsubscribed and will no longer receive emails from %s.',
					{
						args: [ name ],
						comment: 'Name of the site that the user has unsubscribed from.',
					}
				),
			} );
		}
		if ( unsubscribeError ) {
			setNotice( {
				type: NoticeType.Error,
				onClose: () => setNotice( null ),
				message: translate( 'There was an error when trying to unsubscribe from %s.', {
					args: [ name ],
					comment: 'Name of the site that the user tried to unsubscribe from.',
				} ),
			} );
		}
		if ( subscribeError ) {
			setNotice( {
				type: NoticeType.Error,
				action: <Resubscribe />,
				message: translate( 'There was an error when trying to resubscribe to %s.', {
					args: [ name ],
					comment: 'Name of the site that the user tried to resubscribe to.',
				} ),
			} );
		}
	}, [
		siteSubscribed,
		unsubscribeError,
		subscribeError,
		subscribing,
		unsubscribing,
		translate,
		blogId,
		subscribe,
		url,
		name,
	] );

	const feedUrl = getFeedUrl( feedId );

	const recordViewFeedButtonClicked = useRecordViewFeedButtonClicked();

	const handleViewFeedButtonClicked = ( source: string ) => {
		recordViewFeedButtonClicked( {
			blogId: blogId ? String( blogId ) : null,
			feedId: String( feedId ),
			source,
		} );
	};

	const siteTitle = (
		<a
			href={ feedUrl }
			title={ translate( 'View feed' ) }
			onClick={ () => {
				handleViewFeedButtonClicked( 'subscription-site-title' );
			} }
		>
			{ name }
		</a>
	);

	return (
		<>
			<header className="site-subscription-page__header site-subscription-page__centered-content">
				<SiteIcon
					iconUrl={ siteIcon }
					size={ 116 }
					alt={ name }
					href={ feedUrl }
					title={ translate( 'View feed' ) }
					onClick={ () => {
						handleViewFeedButtonClicked( 'subscription-site-icon' );
					} }
				/>
				<FormattedHeader
					brandFont
					headerText={ siteTitle }
					subHeaderAs="div"
					subHeaderText={
						<SiteSubscriptionSubheader
							blogId={ blogId }
							feedId={ feedId }
							subscriberCount={ subscriberCount }
							url={ url }
						/>
					}
				/>
			</header>

			<Notice
				onClose={ notice?.onClose }
				visible={ !! notice }
				type={ notice?.type }
				action={ notice?.action }
			>
				{ notice?.message }
			</Notice>

			{ siteSubscribed && (
				<>
					<SiteSubscriptionSettings
						subscriptionId={ subscriptionId }
						blogId={ blogId }
						notifyMeOfNewPosts={ !! deliveryMethods.notification?.send_posts }
						emailMeNewPosts={ !! deliveryMethods.email?.send_posts }
						deliveryFrequency={
							deliveryMethods.email?.post_delivery_frequency ??
							Reader.EmailDeliveryFrequency.Instantly
						}
						emailMeNewComments={ !! deliveryMethods.email?.send_comments }
					/>

					{ !! deliveryMethods.email?.send_posts && (
						<SubscribeToNewsletterCategories siteId={ blogId } />
					) }

					<hr className="subscriptions__separator" />

					{ /* TODO: Move to SiteSubscriptionInfo component when payment details are in. */ }
					<div className="site-subscription-info">
						<h2 className="site-subscription-info__heading">
							{ translate( 'Subscription details' ) }
						</h2>
						<dl className="site-subscription-info__list">
							<dt>{ translate( 'Since' ) }</dt>
							<dd>
								<TimeSince date={ dateSubscribed || new Date( 0 ).toISOString() } />
							</dd>
						</dl>
						{ paymentPlans.length === 0 && (
							<dl className="site-subscription-info__list">
								<dt>{ translate( 'Status' ) }</dt>
								<dd>
									<Badge type="success">{ translate( 'Active' ) }</Badge>
									{ translate( 'Free subscriber' ) }
								</dd>
							</dl>
						) }
						{ paymentPlans &&
							paymentPlans.map( ( { is_gift, id, renewalPrice, renewalDate } ) => {
								if ( is_gift ) {
									return (
										<dl className="site-subscription-info__list" key={ id }>
											<dt>{ translate( 'Gift' ) }</dt>
											<dd></dd>
										</dl>
									);
								}

								return (
									<dl className="site-subscription-info__list" key={ id }>
										<dt>{ translate( 'Plan' ) }</dt>
										<dd>{ renewalPrice }</dd>
										{ renewalDate && (
											<>
												<dt>{ translate( 'Billing period' ) }</dt>
												<dd>{ translate( 'Renews on %s', { args: [ renewalDate ] } ) }</dd>
											</>
										) }
									</dl>
								);
							} ) }
					</div>

					<div className="site-subscription-page__button-container">
						{ paymentPlans && !! paymentPlans.length && (
							<Button
								className="site-subscription-page__manage-button"
								variant="primary"
								href="/me/purchases"
							>
								{ translate( 'Manage purchases' ) }
							</Button>
						) }
						<Button
							className="site-subscription-page__unsubscribe-button"
							onClick={ onClickCancelSubscriptionButton }
							disabled={ unsubscribing || areAllPaymentsGifts }
						>
							{ translate( 'Unsubscribe' ) }
						</Button>
					</div>
				</>
			) }

			<CancelPaidSubscriptionModal
				isVisible={ showUnsubscribeModal }
				onCancel={ () => setShowUnsubscribeModal( false ) }
				onConfirm={ onConfirmCancelSubscription }
			/>
		</>
	);
};

export default SiteSubscriptionDetails;
