import { Gridicon } from '@automattic/components';
import { SubscriptionManager, Reader } from '@automattic/data-stores';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useNavigate, useParams } from 'react-router-dom';
import WordPressLogo from 'calypso/components/wordpress-logo';
import { Notice, NoticeType } from 'calypso/landing/subscriptions/components/notice';
import PoweredByWPFooter from 'calypso/layout/powered-by-wp-footer';
import './styles.scss';
import SiteSubscriptionDetails from './site-subscription-details';

const isSiteSubscriptionDetailsErrorResponse = (
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	response: any
): response is Reader.SiteSubscriptionDetailsErrorResponse => {
	// This is good enough for us to know that the response is an error response
	return response && ( response.errors || response.error_data );
};

const SiteSubscriptionPage = () => {
	const translate = useTranslate();
	const navigate = useNavigate();
	const { blogId = '' } = useParams();
	const { data, isLoading, error } = SubscriptionManager.useSiteSubscriptionDetailsQuery( blogId );

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
					{ error || ! blogId || ! data || isSiteSubscriptionDetailsErrorResponse( data ) ? (
						<Notice
							className="site-subscription-page__fetch-details-error"
							type={ NoticeType.Error }
						>
							Subscription not found
						</Notice>
					) : (
						<SiteSubscriptionDetails
							name={ data.name }
							subscriberCount={ data.subscriber_count }
							dateSubscribed={ data.date_subscribed }
							siteIcon={ data.site_icon }
							blogId={ data.blog_ID }
							deliveryMethods={ data.delivery_methods }
							url={ data.URL }
						/>
					) }
				</div>
			</div>

			<PoweredByWPFooter />
		</div>
	);
};

export default SiteSubscriptionPage;
