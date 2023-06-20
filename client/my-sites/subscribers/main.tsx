import { translate } from 'i18n-calypso';
import page from 'page';
import { useSelector } from 'react-redux';
import { Item } from 'calypso/components/breadcrumb';
import DocumentHead from 'calypso/components/data/document-head';
import FixedNavigationHeader from 'calypso/components/fixed-navigation-header';
import Main from 'calypso/components/main';
import Pagination from 'calypso/components/pagination';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { EmptyListView } from './components/empty-list-view';
import { GrowYourAudience } from './components/grow-your-audience';
import { SubscriberList } from './components/subscriber-list';
import { UnsubscribeModal } from './components/unsubscribe-modal';
import { usePagination, useUnsubscribeModal } from './hooks';
import { useSubscribersQuery } from './queries';
import { Subscriber } from './types';
import './styles.scss';

type SubscribersProps = {
	pageNumber: number;
	pageChanged: ( page: number ) => void;
};

const DEFAULT_PER_PAGE = 10;

const SubscribersPage = ( { pageNumber, pageChanged }: SubscribersProps ) => {
	const selectedSiteId = useSelector( getSelectedSiteId );
	const selectedSiteSlug = useSelector( getSelectedSiteSlug );
	const initialState = { data: { total: 0, subscribers: [], per_page: DEFAULT_PER_PAGE } };
	const result = useSubscribersQuery( selectedSiteId, pageNumber, DEFAULT_PER_PAGE );
	const {
		data: { total, subscribers = [], per_page },
	} = result && result.data ? result : initialState;
	const { isFetching } = result;
	const { pageClickCallback } = usePagination( pageNumber, pageChanged, isFetching );
	const { currentSubscriber, onClickUnsubscribe, onConfirmModal, resetSubscriber } =
		useUnsubscribeModal( selectedSiteId, pageNumber );
	const onClickView = ( subscriber: Subscriber ) => {
		page.show( `/subscribers/${ selectedSiteSlug }/${ subscriber.subscription_id }` );
	};

	const navigationItems: Item[] = [
		{
			label: translate( 'Subscribers' ),
			href: `/subscribers/${ selectedSiteSlug }`,
			helpBubble: (
				<span>
					{ translate(
						'Add subscribers to your site and send them a free or paid {{link}}newsletter{{/link}}.',
						{
							components: {
								link: (
									<a
										href="https://wordpress.com/support/launch-a-newsletter/#about-your-subscribers"
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
		<Main wideLayout className="subscribers">
			<DocumentHead title={ translate( 'Subscribers' ) } />
			<FixedNavigationHeader navigationItems={ navigationItems }></FixedNavigationHeader>

			<section className="subscribers__section">
				{ total ? (
					<>
						<div className="subscribers__header-count">
							<span className="subscribers__title">{ translate( 'Total' ) }</span>{ ' ' }
							<span className="subscribers__subscriber-count">{ total }</span>
						</div>
						<SubscriberList
							subscribers={ subscribers }
							onView={ onClickView }
							onUnsubscribe={ onClickUnsubscribe }
						/>
					</>
				) : (
					<EmptyListView />
				) }

				<Pagination
					className="subscribers__pagination"
					page={ pageNumber }
					perPage={ per_page }
					total={ total }
					pageClick={ pageClickCallback }
				/>
			</section>

			{ !! total && <GrowYourAudience /> }

			<UnsubscribeModal
				subscriber={ currentSubscriber }
				onCancel={ resetSubscriber }
				onConfirm={ onConfirmModal }
			/>
		</Main>
	);
};

export default SubscribersPage;
