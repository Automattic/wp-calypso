import { recordTracksEvent } from '@automattic/calypso-analytics';
import page from '@automattic/calypso-router';
import { Gridicon, WordPressLogo } from '@automattic/components';
import { Reader } from '@automattic/data-stores';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import JetpackColophon from 'calypso/components/jetpack-colophon';
import { Notice, NoticeType } from 'calypso/landing/subscriptions/components/notice';
import { login } from 'calypso/lib/paths';
import { infoNotice } from 'calypso/state/notices/actions';
import { Path, useSiteSubscription } from './context';
import SiteSubscriptionDetails from './details';
import './styles.scss';

const useHandleSubscriptionNotFoundError = ( transition?: boolean ) => {
	const [ tracked, setTracked ] = useState( false );
	const { data, error, isLoading, blogId, subscriptionId } = useSiteSubscription();
	const dispatch = useDispatch();
	const translate = useTranslate();

	if ( tracked || isLoading ) {
		return;
	}

	if ( error || ! data || Reader.isErrorResponse( data ) ) {
		recordTracksEvent( 'calypso_reader_subscription_not_found', {
			blog_id: blogId,
			subscription_id: subscriptionId,
			transition: transition ? 'true' : 'false',
		} );

		setTracked( true );

		if ( transition ) {
			dispatch(
				infoNotice( translate( "We're updating your subscription. It should be ready shortly." ), {
					displayOnNextPage: true,
					isPersistent: true,
				} )
			);

			page.show( '/reader/subscriptions/' );
		}
	}
};

type ReaderSiteSubscriptionProps = {
	transition?: boolean;
};

const ReaderSiteSubscription = ( { transition }: ReaderSiteSubscriptionProps ) => {
	const translate = useTranslate();
	const { data, isLoading, error, navigate } = useSiteSubscription();

	useHandleSubscriptionNotFoundError( transition );

	if ( isLoading ) {
		return <WordPressLogo size={ 72 } className="wpcom-site__logo" />;
	}

	return (
		<div className="site-subscription-page">
			<Button
				className="site-subscription-page__back-button"
				onClick={ () => navigate( Path.ManageAllSubscriptions ) }
				icon={ <Gridicon icon="chevron-left" size={ 12 } /> }
			>
				{ translate( 'Back' ) }
			</Button>

			<div className="site-subscription-page__centered-content">
				<div className="site-subscription-page__main-content">
					{ error || ! data || Reader.isErrorResponse( data ) ? (
						<Notice
							className="site-subscription-page__fetch-details-error"
							type={ NoticeType.Error }
						>
							{ translate( 'Subscription not found. {{a}}Switch account{{/a}}.', {
								components: {
									a: <a href={ login( { redirectTo: window.location.href } ) } />,
								},
							} ) }
						</Notice>
					) : (
						<SiteSubscriptionDetails
							subscriptionId={ data.ID }
							blogId={ data.blog_ID }
							feedId={ data.feed_ID }
							name={ data.name }
							subscriberCount={ data.subscriber_count }
							dateSubscribed={ data.date_subscribed }
							siteIcon={ data.site_icon }
							deliveryMethods={ data.delivery_methods }
							url={ data.URL }
							paymentDetails={ data.payment_details }
						/>
					) }
				</div>
			</div>

			<JetpackColophon />
		</div>
	);
};

export default ReaderSiteSubscription;

export type { SiteSubscriptionContextProps } from './context';
export { SiteSubscriptionContext } from './context';
