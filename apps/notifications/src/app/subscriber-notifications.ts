import { subscribeUnseenCount } from './client';
import { createNotificationSound } from './notification-sound';

export type SubscriberNotificationCandidate = {
	targetSiteId: number;
	receivedAt: number;
	type: 'follow';
	wasVisibleAtReceipt: boolean;
};

export function subscribeSubscriberNotifications(
	wpcom: Parameters< typeof subscribeUnseenCount >[ 0 ],
	onCount: ( count: number ) => void,
	onConfirmed?: ( candidate: SubscriberNotificationCandidate ) => boolean | void
) {
	let active = true;
	const sound = onConfirmed ? createNotificationSound() : undefined;
	const onSubscriberNotification = onConfirmed
		? ( candidate: SubscriberNotificationCandidate ) => {
				if (
					! active ||
					candidate.type !== 'follow' ||
					! Number.isSafeInteger( candidate.targetSiteId ) ||
					candidate.targetSiteId <= 0 ||
					! Number.isSafeInteger( candidate.receivedAt ) ||
					! candidate.wasVisibleAtReceipt ||
					document.hidden
				) {
					return;
				}

				if ( onConfirmed( candidate ) === false ) {
					return;
				}

				sound?.play();
			}
		: undefined;
	const unsubscribe = subscribeUnseenCount( wpcom, onCount, onSubscriberNotification );

	return () => {
		active = false;
		unsubscribe();
		sound?.dispose();
	};
}
