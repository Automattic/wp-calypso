import { Button, Gridicon } from '@automattic/components';
import { useLocalizeUrl } from '@automattic/i18n-utils';
import { translate } from 'i18n-calypso';
import page from 'page';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Item } from 'calypso/components/breadcrumb';
import DocumentHead from 'calypso/components/data/document-head';
import FixedNavigationHeader from 'calypso/components/fixed-navigation-header';
import Main from 'calypso/components/main';
import { SubscriberListContainer } from 'calypso/my-sites/subscribers/components/subscriber-list-container';
import { SubscribersListManagerProvider } from 'calypso/my-sites/subscribers/components/subscriber-list-manager/subscriber-list-manager-context';
import { successNotice } from 'calypso/state/notices/actions';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { AddSubscribersModal } from './components/add-subscribers-modal';
import { SubscribersHeaderPopover } from './components/subscribers-header-popover';
import { UnsubscribeModal } from './components/unsubscribe-modal';
import { getSubscriberDetailsUrl } from './helpers';
import { useUnsubscribeModal } from './hooks';
import { Subscriber } from './types';
import './style.scss';

type SubscribersProps = {
	pageNumber: number;
	pageChanged: ( page: number ) => void;
};

const SubscribersPage = ( { pageNumber, pageChanged }: SubscribersProps ) => {
	const selectedSiteId = useSelector( getSelectedSiteId );
	const selectedSiteSlug = useSelector( getSelectedSiteSlug );
	const { currentSubscriber, onClickUnsubscribe, onConfirmModal, resetSubscriber } =
		useUnsubscribeModal( selectedSiteId, pageNumber );
	const onClickView = ( { subscription_id, user_id }: Subscriber ) => {
		page.show( getSubscriberDetailsUrl( selectedSiteSlug, subscription_id, user_id, pageNumber ) );
	};
	const [ showAddSubscribersModal, setShowAddSubscribersModal ] = useState( false );
	const dispatch = useDispatch();
	const localizeUrl = useLocalizeUrl();

	const addSubscribersCallback = () => {
		setShowAddSubscribersModal( false );
		dispatch(
			successNotice(
				translate(
					"Your subscriber list is being processed. We'll send you an email when it's finished importing."
				),
				{
					duration: 5000,
				}
			)
		);
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
		<Main wideLayout className="subscribers">
			<DocumentHead title={ translate( 'Subscribers' ) } />

			<SubscribersListManagerProvider
				siteId={ selectedSiteId }
				page={ pageNumber }
				pageChanged={ pageChanged }
			>
				<FixedNavigationHeader navigationItems={ navigationItems }>
					<Button
						className="add-subscribers-button"
						primary
						onClick={ () => setShowAddSubscribersModal( true ) }
					>
						<Gridicon icon="plus" size={ 24 } />
						{ translate( 'Add subscribers' ) }
					</Button>
					<SubscribersHeaderPopover siteId={ selectedSiteId } />
				</FixedNavigationHeader>

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
