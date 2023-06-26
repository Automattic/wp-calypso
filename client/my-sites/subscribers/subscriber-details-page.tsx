import { useTranslate } from 'i18n-calypso';
import page from 'page';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Item } from 'calypso/components/breadcrumb';
import FixedNavigationHeader from 'calypso/components/fixed-navigation-header';
import Main from 'calypso/components/main';
import { useSelector } from 'calypso/state';
import { successNotice } from 'calypso/state/notices/actions';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { SubscriberDetails } from './components/subscriber-details';
import { SubscriberPopover } from './components/subscriber-popover';
import { UnsubscribeModal } from './components/unsubscribe-modal';
import { useUnsubscribeModal } from './hooks';
import useDetailsPageSubscriberRemoveMutation from './mutations/use-details-page-subscriber-remove-mutation';
import useSubscriberDetailsQuery from './queries/use-subscriber-details-query';

type SubscriberDetailsPageProps = {
	subscriptionId?: number;
	userId?: number;
};

const SubscriberDetailsPage = ( { subscriptionId, userId }: SubscriberDetailsPageProps ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const selectedSiteId = useSelector( getSelectedSiteId );
	const selectedSiteSlug = useSelector( getSelectedSiteSlug );
	const { data: subscriber } = useSubscriberDetailsQuery( selectedSiteId, subscriptionId, userId );
	const { mutate, isSuccess } = useDetailsPageSubscriberRemoveMutation(
		selectedSiteId,
		subscriptionId,
		userId
	);
	const {
		currentSubscriber: modalSubscriber,
		onClickUnsubscribe,
		onConfirmModal,
		resetSubscriber,
	} = useUnsubscribeModal( mutate );

	const unsubscribeClickHandler = () => {
		if ( subscriber ) {
			onClickUnsubscribe( subscriber );
		}
	};

	useEffect( () => {
		if ( isSuccess ) {
			resetSubscriber();
			page.show( `/subscribers/${ selectedSiteSlug }` );
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
		}
	}, [
		dispatch,
		isSuccess,
		resetSubscriber,
		selectedSiteSlug,
		subscriber?.display_name,
		translate,
	] );

	const navigationItems: Item[] = [
		{
			label: translate( 'Subscribers' ),
			href: `/subscribers/${ selectedSiteSlug }`,
		},
		{
			label: translate( 'Details' ),
			href: `/subscribers/${ selectedSiteSlug }/${ subscriptionId }`,
		},
	];

	return (
		<Main wideLayout>
			<FixedNavigationHeader navigationItems={ navigationItems }>
				<SubscriberPopover onUnsubscribe={ unsubscribeClickHandler } />
			</FixedNavigationHeader>
			{ subscriber && <SubscriberDetails subscriber={ subscriber } /> }
			<UnsubscribeModal
				subscriber={ modalSubscriber }
				onCancel={ resetSubscriber }
				onConfirm={ onConfirmModal }
			/>
		</Main>
	);
};

export default SubscriberDetailsPage;
