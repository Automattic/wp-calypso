import { useTranslate, numberFormat } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { navigate } from 'calypso/lib/navigate';
import { useDispatch, useSelector } from 'calypso/state';
import { successNotice } from 'calypso/state/notices/actions';
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
	const translate = useTranslate();
	const dispatch = useDispatch();

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
					// Show success notice.
					dispatch(
						successNotice(
							translate(
								'%s has been removed from your subscribers list.',
								'%d subscribers have been removed from your list.',
								{
									count: subscribers.length,
									args:
										subscribers.length === 1
											? [ subscribers[ 0 ].display_name ]
											: [ numberFormat( subscribers.length ) ],
									comment:
										'First %s is subscriber name, second %d is the number of subscribers removed',
								}
							),
							{ duration: 5000 }
						)
					);
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
