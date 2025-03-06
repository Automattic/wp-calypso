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
		const modal = document.querySelector('.components-modal__frame');  // Get the modal
		const mainContent = document.getElementById('wpcom') || document.body;  // Replace 'main-content' with an appropriate ID of a visible element outside the modal

		console.log( 'modal', modal );
		console.log( 'mainContent', mainContent );
		// Hide the modal safely
		if (modal) {
			modal.setAttribute('aria-hidden', 'true');
		}
		// Move focus to a safe element before hiding the modal
		if (mainContent) {
			mainContent.setAttribute('aria-hidden', 'false');
			mainContent.focus();  // Move focus outside the modal
		}

		
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
