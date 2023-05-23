import { Gridicon } from '@automattic/components';
import { SubscriptionManager } from '@automattic/data-stores';
import { Button } from '@wordpress/components';
import { useTranslate, numberFormat } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import FormattedHeader from 'calypso/components/formatted-header';
import TimeSince from 'calypso/components/time-since';
import { Notice, NoticeState, NoticeType } from 'calypso/landing/subscriptions/components/notice';
import { SiteIcon } from 'calypso/landing/subscriptions/components/site-icon';
import PoweredByWPFooter from 'calypso/layout/powered-by-wp-footer';
import SiteSubscriptionSettings from './site-subscription-settings';
import './styles.scss';

const SiteSubscriptionPage = () => {
	const translate = useTranslate();
	const navigate = useNavigate();
	const { blogId = '' } = useParams();

	const { data, isLoading, isError } =
		SubscriptionManager.useSiteSubscriptionDetailsQuery( blogId );

	const [ notice, setNotice ] = useState< NoticeState | null >( null );
	const [ siteSubscribed, setSiteSubscribed ] = useState( true );

	const {
		mutate: subscribe,
		isLoading: subscribing,
		isSuccess: subscribed,
		error: subscribeError,
	} = SubscriptionManager.useSiteSubscribeMutation( blogId );

	const {
		mutate: unsubscribe,
		isLoading: unsubscribing,
		isSuccess: unsubscribed,
		error: unsubscribeError,
	} = SubscriptionManager.useSiteUnsubscribeMutation( blogId );

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
		// todo: style the button (underline, color?, etc.)
		const Resubscribe = () => (
			<Button
				onClick={ () => subscribe( { blog_id: blogId, url: data?.URL } ) }
				disabled={ subscribing || unsubscribing }
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
						args: [ data?.name ],
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
					args: [ data?.name ],
					comment: 'Name of the site that the user tried to unsubscribe from.',
				} ),
			} );
		}
		if ( subscribeError ) {
			setNotice( {
				type: NoticeType.Error,
				action: <Resubscribe />,
				message: translate( 'There was an error when trying to resubscribe to %s.', {
					args: [ data?.name ],
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
		data,
		translate,
		blogId,
		subscribe,
	] );

	if ( ! blogId || isError ) {
		return <div>Something went wrong.</div>;
	}

	if ( isLoading ) {
		// Full page Wordpress logo loader
		return <div>Loading...</div>;
	}

	const subscriberCount = data?.subscriber_count;
	const subHeaderText = subscriberCount
		? translate( '%s subscriber', '%s subscribers', {
				count: subscriberCount,
				args: [ numberFormat( subscriberCount, 0 ) ],
				comment: '%s is the number of subscribers. For example: "12,000,000"',
		  } )
		: '';

	const date_subscribed = data?.date_subscribed;

	return (
		<div className="site-subscription-page">
			<Button
				className="site-subscription-page__back-button"
				onClick={ () => navigate( '/subscriptions/sites' ) }
				icon={ <Gridicon icon="chevron-left" size={ 12 } /> }
			>
				{ translate( 'Manage all subscriptions' ) }
			</Button>

			<div className="site-subscription-page__centered-content">
				<div className="site-subscription-page__main-content">
					<header className="site-subscription-page__header site-subscription-page__centered-content">
						<SiteIcon iconUrl={ data?.site_icon } size={ 116 } />
						<FormattedHeader brandFont headerText={ data?.name } subHeaderText={ subHeaderText } />
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
								blogId={ blogId }
								notifyMeOfNewPosts={ data.delivery_methods?.notification?.send_posts }
								emailMeNewPosts={ data.delivery_methods?.email?.send_posts }
								deliveryFrequency={ data.delivery_methods?.email?.post_delivery_frequency }
								emailMeNewComments={ data.delivery_methods?.email?.send_comments }
							/>

							<hr className="subscriptions__separator" />

							{ /* TODO: Move to SiteSubscriptionInfo component when payment details are in. */ }
							<div className="site-subscription-info">
								<h2 className="site-subscription-info__heading">{ translate( 'Subscription' ) }</h2>
								<dl className="site-subscription-info__list">
									<dt>{ translate( 'Date' ) }</dt>
									<dd>
										<TimeSince
											date={
												( date_subscribed?.valueOf()
													? date_subscribed
													: new Date( 0 )
												).toISOString?.() ?? date_subscribed
											}
										/>
									</dd>
								</dl>
							</div>

							<Button
								className="site-subscription-page__unsubscribe-button"
								isSecondary
								onClick={ () => unsubscribe( { blog_id: blogId, url: data.URL } ) }
								disabled={ unsubscribing }
							>
								{ translate( 'Cancel subscription' ) }
							</Button>
						</>
					) }
				</div>
			</div>

			<PoweredByWPFooter />
		</div>
	);
};

export default SiteSubscriptionPage;
