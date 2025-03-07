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
	const [ currentSubscribers, setCurrentSubscribers ] = useState< Subscriber[] >();
	const selectedSiteSlug = useSelector( getSelectedSiteSlug );
	const recordRemoveModal = useRecordRemoveModal();
	const { mutate } = useSubscriberRemoveMutation( siteId, subscriberQueryParams, detailsView );

	const onSetUnsubscribers = ( subscribers: Subscriber[] ) => {
		setCurrentSubscribers( subscribers );
	};

	const resetSubscribers = () => {
		setCurrentSubscribers( undefined );
	};

	const onConfirmModal = ( action: UnsubscribeActionType, subscribers?: Subscriber[] ) => {
		if ( action === UnsubscribeActionType.Manage ) {
			recordRemoveModal( true, 'manage_button_clicked' );
			const link = isJetpackCloud()
				? `/monetize/supporters/${ selectedSiteSlug }`
				: `/earn/supporters/${ selectedSiteSlug }`;
			navigate( link ?? '' );
		} else if (
			action === UnsubscribeActionType.Unsubscribe &&
			subscribers &&
			subscribers.length
		) {
			mutate( subscribers, {
				onSuccess: () => {
					resetSubscribers();
					onSuccess?.();
				},
			} );
		}

		resetSubscribers();
	};

	// Reset current subscriber on unmount
	useEffect( () => {
		return resetSubscribers;
	}, [] );

	return {
		currentSubscribers,
		onSetUnsubscribers,
		onConfirmModal,
		resetSubscribers,
	};
};

export default useUnsubscribeModal;
