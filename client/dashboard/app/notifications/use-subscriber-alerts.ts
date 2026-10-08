import { userPreferenceQuery } from '@automattic/api-queries';
import config from '@automattic/calypso-config';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import wpcom from 'calypso/lib/wp';
import { useAuth } from '../auth';
import { omnibarEvents } from '../omnibar/events';

export default function useSubscriberAlerts( onCount: ( count: number ) => void ) {
	const { user } = useAuth();
	const isSubscriberAlertsFeatureEnabled = config.isEnabled( 'notifications/subscriber-alerts' );
	const subscriberAlerts = useQuery( {
		...userPreferenceQuery( 'notifications-subscriber-alerts-enabled' ),
		enabled: isSubscriberAlertsFeatureEnabled,
		refetchOnWindowFocus: 'always',
	} );
	const subscriberAlertsEnabled =
		isSubscriberAlertsFeatureEnabled &&
		subscriberAlerts.isSuccess &&
		! subscriberAlerts.isFetching &&
		! subscriberAlerts.isError &&
		subscriberAlerts.data === true;

	useEffect( () => {
		let unsubscribe: ( () => void ) | undefined;
		let epoch = 0;
		const currentEpoch = ++epoch;
		const alertsEnabledAt = Date.now();
		const isCurrent = () => epoch === currentEpoch;

		if ( subscriberAlertsEnabled ) {
			import( '@automattic/notifications/src/app/subscriber-notifications' ).then(
				( { subscribeSubscriberNotifications } ) => {
					if ( isCurrent() ) {
						unsubscribe = subscribeSubscriberNotifications(
							wpcom,
							onCount,
							( notification: { receivedAt: number } ) => {
								if ( ! isCurrent() || notification.receivedAt <= alertsEnabledAt ) {
									return false;
								}

								omnibarEvents.notificationsSubscriberReceived.emit();
								return true;
							}
						);
					}
				}
			);
		} else {
			import( '@automattic/notifications/src/app/client' ).then( ( { subscribeUnseenCount } ) => {
				if ( isCurrent() ) {
					unsubscribe = subscribeUnseenCount( wpcom, onCount );
				}
			} );
		}

		return () => {
			epoch++;
			unsubscribe?.();
		};
	}, [ subscriberAlertsEnabled, user.ID, onCount ] );
}
