import { translate } from 'i18n-calypso';
import Pagination from 'calypso/components/pagination';
import { EmptyListView } from 'calypso/my-sites/subscribers/components/empty-list-view';
import { SubscriberList } from 'calypso/my-sites/subscribers/components/subscriber-list';
import { SubscriberListActionsBar } from 'calypso/my-sites/subscribers/components/subscriber-list-actions-bar';
import { useSubscriberListManager } from 'calypso/my-sites/subscribers/components/subscriber-list-manager/subscriber-list-manager-context';
import { Subscriber } from 'calypso/my-sites/subscribers/types';
import './style.scss';

type SubscriberListContainerProps = {
	onClickView: ( subscriber: Subscriber ) => void;
	onClickUnsubscribe: ( subscriber: Subscriber ) => void;
};

const SubscriberListContainer = ( {
	onClickView,
	onClickUnsubscribe,
}: SubscriberListContainerProps ) => {
	const { grandTotal, total, perPage, page, pageClickCallback } = useSubscriberListManager();

	return (
		<section className="subscriber-list-container">
			{ grandTotal ? (
				<>
					<div className="subscriber-list-container__header">
						<span className="subscriber-list-container__title">{ translate( 'Total' ) }</span>{ ' ' }
						<span className="subscriber-list-container__subscriber-count">{ total }</span>
					</div>
					<SubscriberListActionsBar />

					<SubscriberList onView={ onClickView } onUnsubscribe={ onClickUnsubscribe } />
				</>
			) : (
				<>
					<EmptyListView />
				</>
			) }

			<Pagination
				className="subscriber-list-container__pagination"
				page={ page }
				perPage={ perPage }
				total={ total }
				pageClick={ pageClickCallback }
			/>
		</section>
	);
};

export default SubscriberListContainer;
