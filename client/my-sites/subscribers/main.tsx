import { useLocalizeUrl } from '@automattic/i18n-utils';
import { translate } from 'i18n-calypso';
import page from 'page';
import { useSelector } from 'react-redux';
import { Item } from 'calypso/components/breadcrumb';
import DocumentHead from 'calypso/components/data/document-head';
import Main from 'calypso/components/main';
import { SubscriberListContainer } from 'calypso/my-sites/subscribers/components/subscriber-list-container';
import { SubscribersPageProvider } from 'calypso/my-sites/subscribers/components/subscribers-page/subscribers-page-context';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import { AddSubscribersModal } from './components/add-subscribers-modal';
import { SubscribersHeader } from './components/subscribers-header';
import { UnsubscribeModal } from './components/unsubscribe-modal';
import { SubscribersFilterBy, SubscribersSortBy } from './constants';
import { getSubscriberDetailsUrl, getSubscribersUrl } from './helpers';
import { useUnsubscribeModal } from './hooks';
import { Subscriber } from './types';
import './style.scss';

type SubscribersProps = {
	filterOption: SubscribersFilterBy;
	pageNumber: number;
	searchTerm: string;
	sortTerm: SubscribersSortBy;
	filterOptionChanged: ( option: SubscribersFilterBy ) => void;
	pageChanged: ( page: number ) => void;
	searchTermChanged: ( term: string ) => void;
	sortTermChanged: ( term: SubscribersSortBy ) => void;
};

const SubscribersPage = ( {
	filterOption,
	pageNumber,
	searchTerm,
	sortTerm,
	filterOptionChanged,
	pageChanged,
	searchTermChanged,
	sortTermChanged,
}: SubscribersProps ) => {
	const selectedSite = useSelector( getSelectedSite );

	const pageArgs = {
		currentPage: pageNumber,
		filterOption,
		searchTerm,
		sortTerm,
	};

	const { currentSubscriber, onClickUnsubscribe, onConfirmModal, resetSubscriber } =
		useUnsubscribeModal( selectedSite?.ID, pageArgs );
	const onClickView = ( { subscription_id, user_id }: Subscriber ) => {
		page.show( getSubscriberDetailsUrl( selectedSite?.slug, subscription_id, user_id, pageArgs ) );
	};

	const localizeUrl = useLocalizeUrl();

	const navigationItems: Item[] = [
		{
			label: translate( 'Subscribers' ),
			href: getSubscribersUrl( selectedSite?.slug, pageArgs ),
			helpBubble: (
				<span>
					{ translate(
						'Add subscribers to your site and send them a free or paid {{link}}newsletter{{/link}}.',
						{
							components: {
								link: (
									<a
										href={ localizeUrl(
											'https://wordpress.com/support/launch-a-newsletter/#about-your-subscribers'
										) }
										target="blank"
									/>
								),
							},
						}
					) }
				</span>
			),
		},
	];

	return (
		<SubscribersPageProvider
			siteId={ selectedSite?.ID }
			filterOption={ filterOption }
			pageNumber={ pageNumber }
			searchTerm={ searchTerm }
			sortTerm={ sortTerm }
			filterOptionChanged={ filterOptionChanged }
			pageChanged={ pageChanged }
			searchTermChanged={ searchTermChanged }
			sortTermChanged={ sortTermChanged }
		>
			<Main wideLayout className="subscribers">
				<DocumentHead title={ translate( 'Subscribers' ) } />

				<SubscribersHeader
					navigationItems={ navigationItems }
					selectedSiteId={ selectedSite?.ID }
				/>

				<SubscriberListContainer
					onClickView={ onClickView }
					onClickUnsubscribe={ onClickUnsubscribe }
				/>

				<UnsubscribeModal
					subscriber={ currentSubscriber }
					onCancel={ resetSubscriber }
					onConfirm={ onConfirmModal }
				/>
				{ selectedSite && (
					<AddSubscribersModal siteId={ selectedSite.ID } siteTitle={ selectedSite.title } />
				) }
			</Main>
		</SubscribersPageProvider>
	);
};

export default SubscribersPage;
