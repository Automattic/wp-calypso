import { subscribeUnseenCount } from './client';
import { createNotificationSound } from './notification-sound';
import type { ClientOptions } from './client';
import type { NotificationSoundOptions, NotificationSoundResult } from './notification-sound';

export type SubscriberNotificationCandidate = {
	targetSiteId: number;
	receivedAt: number;
	type: 'follow';
	wasVisibleAtReceipt: boolean;
};

export function subscribeSubscriberNotifications(
	wpcom: Parameters< typeof subscribeUnseenCount >[ 0 ],
	onCount: ( count: number ) => void,
	onConfirmed?: ( candidate: SubscriberNotificationCandidate ) => boolean | void,
	{
		onSound,
		onError,
		...clientOptions
	}: ClientOptions & {
		onSound?: (
			result: NotificationSoundResult,
			candidate: SubscriberNotificationCandidate
		) => void;
		onError?: NotificationSoundOptions[ 'onError' ];
	} = {}
) {
	let active = true;
	const sound = onConfirmed ? createNotificationSound( { onError } ) : undefined;
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

				const result = sound?.play();
				if ( result instanceof Promise ) {
					void result.then( ( settled ) => onSound?.( settled, candidate ) );
				} else if ( result ) {
					onSound?.( result, candidate );
				}
			}
		: undefined;
	const unsubscribe = subscribeUnseenCount(
		wpcom,
		onCount,
		onSubscriberNotification,
		clientOptions
	);

	return () => {
		active = false;
		unsubscribe();
		sound?.dispose();
	};
}
