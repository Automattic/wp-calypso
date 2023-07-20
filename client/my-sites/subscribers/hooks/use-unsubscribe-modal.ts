import { useEffect, useState } from 'react';
import { useSelector } from 'calypso/state';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { UnsubscribeActionType } from '../components/unsubscribe-modal';
import { getEarnPaymentsPageUrl } from '../helpers';
import { useSubscriberRemoveMutation } from '../mutations';
import { useRecordRemoveModal } from '../tracks';
import { Subscriber, SubscriberListArgs } from '../types';

const useUnsubscribeModal = (
	siteId: number | undefined | null,
	args: SubscriberListArgs,
	detailsView = false,
	onSuccess?: () => void
) => {
	const [ currentSubscriber, setCurrentSubscriber ] = useState< Subscriber >();
	const selectedSiteSlug = useSelector( getSelectedSiteSlug );
	const recordRemoveModal = useRecordRemoveModal();
	const { mutate } = useSubscriberRemoveMutation( siteId, args, detailsView );

	const onClickUnsubscribe = ( subscriber: Subscriber ) => {
		setCurrentSubscriber( subscriber );
	};

	const resetSubscriber = () => {
		setCurrentSubscriber( undefined );
	};

	const onConfirmModal = ( action: UnsubscribeActionType, subscriber?: Subscriber ) => {
		if ( action === UnsubscribeActionType.Manage ) {
			recordRemoveModal( true, 'manage_button_clicked' );
			window.open( getEarnPaymentsPageUrl( selectedSiteSlug ), '_blank' );
		} else if ( action === UnsubscribeActionType.Unsubscribe && subscriber ) {
			mutate( subscriber, {
				onSuccess: () => {
					resetSubscriber();
					onSuccess?.();
				},
			} );
		}

		resetSubscriber();
	};

	// Reset current subscriber on unmount
	useEffect( () => {
		return resetSubscriber;
	}, [] );

	return {
		currentSubscriber,
		onClickUnsubscribe,
		onConfirmModal,
		resetSubscriber,
	};
};

export default useUnsubscribeModal;
