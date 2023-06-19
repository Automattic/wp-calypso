import { Button, Gridicon } from '@automattic/components';
import { translate } from 'i18n-calypso';
import page from 'page';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Item } from 'calypso/components/breadcrumb';
import DocumentHead from 'calypso/components/data/document-head';
import FixedNavigationHeader from 'calypso/components/fixed-navigation-header';
import Main from 'calypso/components/main';
import Pagination from 'calypso/components/pagination';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { successNotice } from 'calypso/state/notices/actions';
import { AddSubscribersModal } from './components/add-subscribers-modal';
import { EmptyListView } from './components/empty-list-view';
import { GrowYourAudience } from './components/grow-your-audience';
import { SubscriberList } from './components/subscriber-list';
import { SubscribersHeaderPopover } from './components/subscribers-header-popover';
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
	const [ showAddSubscribersModal, setShowAddSubscribersModal ] = useState( false );
	const dispatch = useDispatch();

	const addSubscribersCallback = () => {
		setShowAddSubscribersModal( false );
		dispatch(
			successNotice(
				translate( 'Your subscriber list is being processed. Please check your email for status.' ),
				{
					duration: 5000,
				}
			)
		);
	};

	const navigationItems: Item[] = [
		{
			label: 'Subscribers',
			href: `/subscribers`,
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
			<FixedNavigationHeader navigationItems={ navigationItems }>
				<Button
					className="add-subscribers-button"
					compact
					primary
					onClick={ () => setShowAddSubscribersModal( true ) }
				>
					<Gridicon icon="plus" size={ 16 } />
					{ translate( 'Add subscribers' ) }
				</Button>
				<SubscribersHeaderPopover siteId={ selectedSiteId } />
			</FixedNavigationHeader>

			<section className="subscribers__section">
				{ total ? (
					<>
						<div className="subscribers__header">
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
			{ selectedSiteId && (
				<AddSubscribersModal
					siteId={ selectedSiteId }
					showModal={ showAddSubscribersModal }
					onClose={ () => setShowAddSubscribersModal( false ) }
					onAddFinished={ () => addSubscribersCallback() }
				/>
			) }
		</Main>
	);
};

export default SubscribersPage;
