import { Gridicon } from '@automattic/components';
import { EmailDeliveryFrequency } from '@automattic/data-stores';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useNavigate, useParams } from 'react-router-dom';
import FormattedHeader from 'calypso/components/formatted-header';
import { SiteIcon } from 'calypso/landing/subscriptions/components/site-icon';
import PoweredByWPFooter from 'calypso/layout/powered-by-wp-footer';
import SiteSubscriptionSettings from './site-subscription-settings';
import './styles.scss';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const useSiteSubscription = ( blogId?: string ) => ( {
	// TODO: Use function to format number
	data: {
		siteName: 'The Atavist Magazine',
		followers: '44,109,166 followers',
		siteUrl: 'https://theatavistmagazine.wordpress.com/',
		notifyMeOfNewPosts: true,
		emailMeNewPosts: true,
		newPostsEmailFrequency: EmailDeliveryFrequency.Daily,
		emailMeNewComments: true,
	},
	isLoading: false,
	isError: false,
} );

const SiteSubscriptionPage = () => {
	const translate = useTranslate();
	const navigate = useNavigate();
	const { blogId } = useParams();
	const { data, isLoading, isError } = useSiteSubscription( blogId );
	const { siteName, followers } = data;

	if ( ! blogId || isError ) {
		return <div>Something went wrong.</div>;
	}

	if ( isLoading ) {
		// Full page Wordpress logo loader
		return <div>Loading...</div>;
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
					<header className="site-subscription-page__header site-subscription-page__centered-content">
						<SiteIcon
							iconUrl="https://simplesitetest456643757.files.wordpress.com/2022/03/cropped-pexels-photo-190340.jpeg"
							size={ 116 }
						/>
						<FormattedHeader brandFont headerText={ siteName } subHeaderText={ followers } />
					</header>

					<SiteSubscriptionSettings value={ data } />

					<hr className="subscriptions__separator" />

					<Button className="site-subscription-page__unsubscribe-button" isDestructive>
						{ translate( 'Cancel subscription' ) }
					</Button>
				</div>
			</div>

			<PoweredByWPFooter />
		</div>
	);
};

export default SiteSubscriptionPage;
