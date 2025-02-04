import { useTranslate, numberFormat } from 'i18n-calypso';
import { useEffect } from 'react';
import Pagination from 'calypso/components/pagination';
import { EmptyListView } from 'calypso/my-sites/subscribers/components/empty-list-view';
import { NoSearchResults } from 'calypso/my-sites/subscribers/components/no-search-results';
import { SubscriberLaunchpad } from 'calypso/my-sites/subscribers/components/subscriber-launchpad';
import { SubscriberList } from 'calypso/my-sites/subscribers/components/subscriber-list';
import { SubscriberListActionsBar } from 'calypso/my-sites/subscribers/components/subscriber-list-actions-bar';
import { useSubscribersPage } from 'calypso/my-sites/subscribers/components/subscribers-page/subscribers-page-context';
import { Subscriber } from 'calypso/my-sites/subscribers/types';
import { useSelector } from 'calypso/state';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import { isSimpleSite } from 'calypso/state/sites/selectors';
import { useRecordSearch } from '../../tracks';
import { GrowYourAudience } from '../grow-your-audience';
import './style.scss';

type SubscriberListContainerProps = {
	siteId: number | null;
	onClickView: ( subscriber: Subscriber ) => void;
	onClickUnsubscribe: ( subscriber: Subscriber ) => void;
	onGiftSubscription: ( subscriber: Subscriber ) => void;
};

const SubscriberListContainer = ( {
	siteId,
	onClickView,
	onClickUnsubscribe,
	onGiftSubscription,
}: SubscriberListContainerProps ) => {
	const {
		grandTotal,
		total,
		perPage,
		page,
		pageChangeCallback,
		searchTerm,
		isLoading,
		subscribers,
		pages,
		isOwnerSubscribed,
	} = useSubscribersPage();
	useRecordSearch();

	const translate = useTranslate();
	const isSimple = useSelector( isSimpleSite );
	const isAtomic = useSelector( ( state ) => isAtomicSite( state, siteId ) );
	const EmptyComponent = isSimple || isAtomic ? SubscriberLaunchpad : EmptyListView;
	const shouldShowLaunchpad =
		! isLoading && ! searchTerm && ( ! grandTotal || ( grandTotal === 1 && isOwnerSubscribed ) );
	const shouldShowSubscriberList = ! isLoading && Boolean( grandTotal ) && ! shouldShowLaunchpad;
	const shouldShowSubscriberHeader = Boolean( grandTotal ) && ! shouldShowLaunchpad;

	useEffect( () => {
		if ( ! isLoading && subscribers.length === 0 && page > 1 ) {
			pageChangeCallback( pages ?? 0 );
		}
	}, [ isLoading, subscribers, page, pageChangeCallback, pages ] );

	return (
		<section className="subscriber-list-container">
			{ shouldShowSubscriberHeader && (
				<>
					<div className="subscriber-list-container__header">
						<span className="subscriber-list-container__title">
							{ translate( 'Total', {
								context: 'Total number of subscribers',
							} ) }
						</span>{ ' ' }
						<span
							className={ `subscriber-list-container__subscriber-count ${
								isLoading ? 'loading-placeholder' : ''
							}` }
						>
							{ numberFormat( total ) }
						</span>
					</div>

					<SubscriberListActionsBar />
				</>
			) }
			{ isLoading &&
				new Array( 10 ).fill( null ).map( ( _, index ) => (
					<div className="subscriber-list__loading" key={ index } data-ignored={ _ }>
						<div className="loading-placeholder big"></div>
						<div className="loading-placeholder small"></div>
						<div className="loading-placeholder small"></div>
						<div className="loading-placeholder small hidden"></div>
					</div>
				) ) }
			{ shouldShowSubscriberList && (
				<>
					{ Boolean( total ) && (
						<SubscriberList
							onView={ onClickView }
							onGiftSubscription={ onGiftSubscription }
							onUnsubscribe={ onClickUnsubscribe }
						/>
					) }
					{ ! total && <NoSearchResults searchTerm={ searchTerm } /> }

					<Pagination
						className="subscriber-list-container__pagination"
						page={ page }
						perPage={ perPage }
						total={ total }
						pageClick={ pageChangeCallback }
					/>

					<GrowYourAudience />
				</>
			) }
			{ shouldShowLaunchpad && <EmptyComponent /> }
		</section>
	);
};

export default SubscriberListContainer;
