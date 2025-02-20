import { useEffect, useState } from 'react';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { navigate } from 'calypso/lib/navigate';
import { useSelector } from 'calypso/state';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { UnsubscribeActionType } from '../components/unsubscribe-modal';
import { useSubscriberRemoveMutation } from '../mutations';
import { useRecordRemoveModal } from '../tracks';
import { Subscriber, SubscriberQueryParams } from '../types';

const useUnsubscribeModal = (
	siteId: number | null,
	subscriberQueryParams: SubscriberQueryParams,
	detailsView = false,
	onSuccess?: () => void
) => {
	const [ currentSubscriber, setCurrentSubscriber ] = useState< Subscriber >();
	const selectedSiteSlug = useSelector( getSelectedSiteSlug );
	const recordRemoveModal = useRecordRemoveModal();
	const { mutate } = useSubscriberRemoveMutation( siteId, subscriberQueryParams, detailsView );

	const onClickUnsubscribe = ( subscriber: Subscriber ) => {
		setCurrentSubscriber( subscriber );
	};

	const resetSubscriber = () => {
		setCurrentSubscriber( undefined );
	};

	const onConfirmModal = ( action: UnsubscribeActionType, subscriber?: Subscriber ) => {
		if ( action === UnsubscribeActionType.Manage ) {
			recordRemoveModal( true, 'manage_button_clicked' );
			const link = isJetpackCloud()
				? `/monetize/supporters/${ selectedSiteSlug }`
				: `/earn/supporters/${ selectedSiteSlug }`;
			navigate( link ?? '' );
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
