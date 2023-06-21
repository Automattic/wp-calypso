import { translate } from 'i18n-calypso';
import page from 'page';
import { useSelector } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import Main from 'calypso/components/main';
import { SubscriberListContainer } from 'calypso/my-sites/subscribers/components/subscriber-list-container';
import { SubscribersListManagerProvider } from 'calypso/my-sites/subscribers/components/subscriber-list-manager/subscriber-list-manager-context';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { UnsubscribeModal } from './components/unsubscribe-modal';
import { useUnsubscribeModal } from './hooks';
import { Subscriber } from './types';
import './styles.scss';

type SubscribersProps = {
	pageNumber: number;
	pageChanged: ( page: number ) => void;
};

const SubscribersPage = ( { pageNumber, pageChanged }: SubscribersProps ) => {
	const selectedSiteId = useSelector( getSelectedSiteId );
	const selectedSiteSlug = useSelector( getSelectedSiteSlug );

	const { currentSubscriber, onClickUnsubscribe, onConfirmModal, resetSubscriber } =
		useUnsubscribeModal( selectedSiteId, pageNumber );
	const onClickView = ( subscriber: Subscriber ) => {
		page.show( `/subscribers/${ selectedSiteSlug }/${ subscriber.subscription_id }` );
	};

	return (
		<Main wideLayout className="subscribers">
			<DocumentHead title={ translate( 'Subscribers' ) } />

			<SubscribersListManagerProvider
				siteId={ selectedSiteId }
				page={ pageNumber }
				pageChanged={ pageChanged }
			>
				<SubscriberListContainer
					onClickView={ onClickView }
					onClickUnsubscribe={ onClickUnsubscribe }
				/>
			</SubscribersListManagerProvider>

			<UnsubscribeModal
				subscriber={ currentSubscriber }
				onCancel={ resetSubscriber }
				onConfirm={ onConfirmModal }
			/>
		</Main>
	);
};

export default SubscribersPage;
