import { Spinner } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
import { useDispatch } from 'react-redux';
import { Item } from 'calypso/components/breadcrumb';
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import { useSubscribedNewsletterCategories } from 'calypso/data/newsletter-categories';
import { useSelector } from 'calypso/state';
import { successNotice } from 'calypso/state/notices/actions';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { SubscriberDetails } from './components/subscriber-details';
import { SubscriberPopover } from './components/subscriber-popover';
import { UnsubscribeModal } from './components/unsubscribe-modal';
import { SubscribersFilterBy, SubscribersSortBy } from './constants';
import { getSubscriberDetailsUrl, getSubscribersUrl } from './helpers';
import { useUnsubscribeModal } from './hooks';
import { useSubscriberDetailsQuery } from './queries';
import './subscriber-details-style.scss';

type SubscriberDetailsPageProps = {
	subscriptionId?: number;
	userId?: number;
	filterOption?: SubscribersFilterBy;
	pageNumber?: number;
	searchTerm?: string;
	sortTerm?: SubscribersSortBy;
};

const SubscriberDetailsPage = ( {
	subscriptionId,
	userId,
	filterOption,
	pageNumber = 1,
	searchTerm,
	sortTerm,
}: SubscriberDetailsPageProps ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const selectedSiteId = useSelector( getSelectedSiteId );
	const selectedSiteSlug = useSelector( getSelectedSiteSlug );

	const { data: subscriber, isLoading: isLoadingDetails } = useSubscriberDetailsQuery(
		selectedSiteId,
		subscriptionId,
		userId
	);
	const { data: subscribedNewsletterCategoriesData, isLoading: isLoadingNewsletterCategories } =
		useSubscribedNewsletterCategories( {
			siteId: selectedSiteId as number,
			subscriptionId: subscriber?.subscription_id,
			userId,
		} );

	const isLoading = isLoadingDetails || isLoadingNewsletterCategories;

	const pageArgs = {
		currentPage: pageNumber,
		filterOption,
		searchTerm,
		sortTerm,
	};

	const subscribersUrl = getSubscribersUrl( selectedSiteSlug, pageArgs );

	const removeSubscriberSuccess = () => {
		page.show( subscribersUrl );

		dispatch(
			successNotice(
				translate( 'You have successfully removed %s from your list.', {
					args: [ subscriber?.display_name as string ],
					comment: "%s is the subscriber's public display name",
				} ),
				{
					duration: 5000,
				}
			)
		);
	};

	const {
		currentSubscriber: modalSubscriber,
		onClickUnsubscribe,
		onConfirmModal,
		resetSubscriber,
	} = useUnsubscribeModal( selectedSiteId, pageArgs, true, removeSubscriberSuccess );

	const unsubscribeClickHandler = () => {
		if ( subscriber ) {
			onClickUnsubscribe( subscriber );
		}
	};

	const navigationItems: Item[] = [
		{
			label: translate( 'Subscribers' ),
			href: subscribersUrl,
		},
		{
			label: translate( 'Details' ),
			href: getSubscriberDetailsUrl( selectedSiteSlug, subscriptionId, userId, pageArgs ),
		},
	];

	return (
		<Main wideLayout className="subscriber-details-page">
			<NavigationHeader navigationItems={ navigationItems }>
				<SubscriberPopover onUnsubscribe={ unsubscribeClickHandler } />
			</NavigationHeader>
			{ subscriber && ! isLoading && selectedSiteId && (
				<SubscriberDetails
					subscriber={ subscriber }
					siteId={ selectedSiteId }
					subscriptionId={ subscriptionId }
					userId={ userId }
					newsletterCategoriesEnabled={ subscribedNewsletterCategoriesData?.enabled }
					newsletterCategories={ subscribedNewsletterCategoriesData?.newsletterCategories }
				/>
			) }
			<UnsubscribeModal
				subscriber={ modalSubscriber }
				onCancel={ resetSubscriber }
				onConfirm={ onConfirmModal }
			/>
			{ isLoading && (
				<div className="subscriber-details-page__loading">
					<Spinner />
				</div>
			) }
		</Main>
	);
};

export default SubscriberDetailsPage;
