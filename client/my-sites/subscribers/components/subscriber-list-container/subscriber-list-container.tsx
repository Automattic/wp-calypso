import { numberFormat, translate } from 'i18n-calypso';
import Pagination from 'calypso/components/pagination';
import { EmptyListView } from 'calypso/my-sites/subscribers/components/empty-list-view';
import { NoSearchResults } from 'calypso/my-sites/subscribers/components/no-search-results';
import { SubscriberList } from 'calypso/my-sites/subscribers/components/subscriber-list';
import { SubscriberListActionsBar } from 'calypso/my-sites/subscribers/components/subscriber-list-actions-bar';
import { useSubscribersPage } from 'calypso/my-sites/subscribers/components/subscribers-page/subscribers-page-context';
import { Subscriber } from 'calypso/my-sites/subscribers/types';
import { useRecordSearch } from '../../tracks';
import { GrowYourAudience } from '../grow-your-audience';
import './style.scss';

type SubscriberListContainerProps = {
	onClickView: ( subscriber: Subscriber ) => void;
	onClickUnsubscribe: ( subscriber: Subscriber ) => void;
};

const SubscriberListContainer = ( {
	onClickView,
	onClickUnsubscribe,
}: SubscriberListContainerProps ) => {
	const { grandTotal, total, perPage, page, pageChangeCallback, searchTerm, isLoading } =
		useSubscribersPage();
	useRecordSearch();
	return (
		<section className="subscriber-list-container">
			{ ! isLoading && ( Boolean( grandTotal ) || searchTerm ) && (
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
							{ numberFormat( total, 0 ) }
						</span>
					</div>

					<SubscriberListActionsBar />
				</>
			) }
			{ isLoading &&
				new Array( 10 ).fill( null ).map( ( _, index ) => (
					<div key={ index } data-ignored={ _ }>
						<div className="loading-placeholder big"></div>
						<div className="loading-placeholder small"></div>
						<div className="loading-placeholder small"></div>
						<div className="loading-placeholder small hidden"></div>
					</div>
				) ) }
			{ ! isLoading && Boolean( grandTotal ) && (
				<>
					{ Boolean( total ) && (
						<SubscriberList onView={ onClickView } onUnsubscribe={ onClickUnsubscribe } />
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
			{ ! isLoading && ! grandTotal && ! searchTerm && <EmptyListView /> }
		</section>
	);
};

export default SubscriberListContainer;
