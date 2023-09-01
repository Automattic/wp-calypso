import { Gridicon } from '@automattic/components';
import { Reader } from '@automattic/data-stores';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import WordPressLogo from 'calypso/components/wordpress-logo';
import { Notice, NoticeType } from 'calypso/landing/subscriptions/components/notice';
import PoweredByWPFooter from 'calypso/layout/powered-by-wp-footer';
import { useSiteSubscription } from './context';
import SiteSubscriptionDetails from './details';
import './styles.scss';

const ReaderSiteSubscription = () => {
	const translate = useTranslate();
	const { blogId, data, isLoading, error, navigate } = useSiteSubscription();

	if ( isLoading ) {
		return <WordPressLogo size={ 72 } className="wpcom-site__logo" />;
	}

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
					{ error || ! blogId || ! data || Reader.isErrorResponse( data ) ? (
						<Notice
							className="site-subscription-page__fetch-details-error"
							type={ NoticeType.Error }
						>
							Subscription not found
						</Notice>
					) : (
						<SiteSubscriptionDetails
							blogId={ blogId }
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

			<PoweredByWPFooter />
		</div>
	);
};

export default ReaderSiteSubscription;

export type { SiteSubscriptionContextProps } from './context';
export { SiteSubscriptionContext } from './context';
