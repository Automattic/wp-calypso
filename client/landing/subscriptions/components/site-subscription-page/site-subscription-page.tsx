import { Gridicon } from '@automattic/components';
import { Reader, SubscriptionManager } from '@automattic/data-stores';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import FormattedHeader from 'calypso/components/formatted-header';
import { Notice, NoticeType } from 'calypso/landing/subscriptions/components/notice';
import { SiteIcon } from 'calypso/landing/subscriptions/components/site-icon';
import PoweredByWPFooter from 'calypso/layout/powered-by-wp-footer';
import SiteSubscriptionSettings from './site-subscription-settings';
import './styles.scss';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const useSiteSubscription = ( blogId?: string ) => ( {
	// TODO: Use function to format number
	data: {
		siteName: 'The Atavist Magazine',
		subscribers: 44109166,
		siteUrl: 'https://ivanthemetest.wordpress.com/',
		notifyMeOfNewPosts: true,
		emailMeNewPosts: true,
		deliveryFrequency: Reader.EmailDeliveryFrequency.Daily,
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
	const {
		siteName,
		notifyMeOfNewPosts,
		emailMeNewComments,
		emailMeNewPosts,
		deliveryFrequency,
		subscribers,
	} = data;
	const [ showSettings, setShowSettings ] = useState( true );
	const Resubscribe = () => <Button onClick={ () => null }>{ translate( 'Resubscribe' ) }</Button>;

	const {
		mutate: unsubscribe,
		isLoading: unsubscribing,
		isSuccess: unsubscribed,
		error: unsubscribeError,
	} = SubscriptionManager.useSiteUnsubscribeMutation();

	useEffect( () => {
		if ( unsubscribed ) {
			setShowSettings( false );
		}
	}, [ unsubscribed ] );

	if ( ! blogId || isError ) {
		return <div>Something went wrong.</div>;
	}

	if ( isLoading ) {
		// Full page Wordpress logo loader
		return <div>Loading...</div>;
	}

	const subHeaderText =
		subscribers > 1
			? translate( '%d subscribers', {
					args: [ subscribers ],
					comment: 'Number of subscribers of the subscribed-to site.',
			  } )
			: '';

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
						<FormattedHeader brandFont headerText={ siteName } subHeaderText={ subHeaderText } />
					</header>

					{ unsubscribed && (
						<Notice type={ NoticeType.Success }>
							{ translate(
								'You have successfully unsubscribed and will no longer receive emails from %s.',
								{
									args: [ data.siteName ],
									comment: 'Name of the site that the user has unsubscribed from.',
								}
							) }
						</Notice>
					) }

					{ unsubscribeError && (
						<Notice type={ NoticeType.Error } action={ <Resubscribe /> }>
							{ translate( 'There was an error when trying to unsubscribe from %s.', {
								args: [ data.siteName ],
								comment: 'Name of the site that the user tried to unsubscribe from.',
							} ) }
						</Notice>
					) }

					{ showSettings && (
						<>
							<SiteSubscriptionSettings
								blogId={ blogId }
								notifyMeOfNewPosts={ notifyMeOfNewPosts }
								emailMeNewPosts={ emailMeNewPosts }
								deliveryFrequency={ deliveryFrequency }
								emailMeNewComments={ emailMeNewComments }
							/>

							<hr className="subscriptions__separator" />

							<Button
								className="site-subscription-page__unsubscribe-button"
								isSecondary
								onClick={ () => unsubscribe( { blog_id: blogId, url: data.siteUrl } ) }
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
