import { translate } from 'i18n-calypso';
import Pagination from 'calypso/components/pagination';
import { EmptyListView } from 'calypso/my-sites/subscribers/components/empty-list-view';
import { SubscriberList } from 'calypso/my-sites/subscribers/components/subscriber-list';
import { SubscriberListActionsBar } from 'calypso/my-sites/subscribers/components/subscriber-list-actions-bar';
import { useSubscriberListManager } from 'calypso/my-sites/subscribers/components/subscriber-list-manager/subscriber-list-manager-context';
import { Subscriber } from 'calypso/my-sites/subscribers/types';
import './styles.scss';

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
		<section className="subscribers__section">
			{ grandTotal ? (
				<>
					<div className="subscribers__header">
						<span className="subscribers__title">{ translate( 'Total' ) }</span>{ ' ' }
						<span className="subscribers__subscriber-count">{ total }</span>
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
				className="subscribers__pagination"
				page={ page }
				perPage={ perPage }
				total={ total }
				pageClick={ pageClickCallback }
			/>
		</section>
	);
};

export default SubscriberListContainer;
