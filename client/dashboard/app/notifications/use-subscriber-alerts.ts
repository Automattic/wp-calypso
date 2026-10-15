import { userPreferenceQuery } from '@automattic/api-queries';
import config from '@automattic/calypso-config';
import { captureException } from '@automattic/calypso-sentry';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { logToLogstash } from 'calypso/lib/logstash';
import wpcom from 'calypso/lib/wp';
import { bumpStat, useAnalytics } from '../analytics';
import { useAuth } from '../auth';
import { isChunkLoadError } from '../chunk-load-recovery';
import { omnibarEvents } from '../omnibar/events';

function toError( error: unknown ) {
	return error instanceof Error ? error : new Error( String( error ) );
}

function reportSubscribeError( error: unknown, stage: 'subscriber_alerts' | 'unseen_count' ) {
	const normalizedError = toError( error );
	// A stale deploy rather than a bug, but it leaves the unseen badge frozen.
	if ( isChunkLoadError( normalizedError ) ) {
		bumpStat( 'dashboard-notifications-chunk', stage );
		return;
	}

	captureException( normalizedError, {
		tags: { calypso_section: 'dashboard', notifications_stage: stage },
	} );
}

function logSoundError( error: unknown, stage: string ) {
	const normalizedError = toError( error );
	logToLogstash( {
		feature: 'calypso_client',
		message: normalizedError.message,
		tags: [ 'dashboard', 'subscriber-alerts' ],
		properties: {
			stage,
			error_name: normalizedError.name,
			env_id: config( 'env_id' ),
			message: normalizedError.message,
			stack: normalizedError.stack,
			path: window.location.href,
		},
	} ).catch( () => {} );
}

// Every open tab hears the same follow, and bursts hit the cooldown, so these
// would only multiply the event count.
const untrackedSoundResults = new Set( [ 'hidden', 'cooldown', 'disposed' ] );

export default function useSubscriberAlerts(
	onCount: ( count: number ) => void,
	includeNoteContext: boolean
) {
	const { user } = useAuth();
	const { recordTracksEvent } = useAnalytics();
	const recordTracksEventRef = useRef( recordTracksEvent );
	useEffect( () => {
		recordTracksEventRef.current = recordTracksEvent;
	}, [ recordTracksEvent ] );
	const isSubscriberAlertsFeatureEnabled = config.isEnabled( 'notifications/subscriber-alerts' );
	const subscriberAlerts = useQuery( {
		...userPreferenceQuery( 'notifications-subscriber-alerts-enabled' ),
		enabled: isSubscriberAlertsFeatureEnabled,
		refetchOnWindowFocus: 'always',
	} );
	const subscriberAlertsEnabled =
		isSubscriberAlertsFeatureEnabled &&
		subscriberAlerts.isSuccess &&
		// The persisted cache can hold a day-old `true`, so wait for the server's answer.
		subscriberAlerts.isFetchedAfterMount &&
		! subscriberAlerts.isError &&
		subscriberAlerts.data === true;

	useEffect( () => {
		let unsubscribe: ( () => void ) | undefined;
		let epoch = 0;
		const currentEpoch = ++epoch;
		const alertsEnabledAt = Date.now();
		const isCurrent = () => epoch === currentEpoch;

		if ( subscriberAlertsEnabled ) {
			import( '@automattic/notifications/src/app/subscriber-notifications' )
				.then( ( { subscribeSubscriberNotifications } ) => {
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
							},
							{
								includeNoteContext,
								onSound: ( result ) => {
									if ( isCurrent() && ! untrackedSoundResults.has( result ) ) {
										recordTracksEventRef.current(
											'calypso_dashboard_notifications_subscriber_alert',
											{
												sound_result: result,
											}
										);
									}
								},
								onError: ( error, stage ) => logSoundError( error, stage ),
							}
						);
					}
				} )
				.catch( ( error ) => reportSubscribeError( error, 'subscriber_alerts' ) );
		} else {
			import( '@automattic/notifications/src/app/client' )
				.then( ( { subscribeUnseenCount } ) => {
					if ( isCurrent() ) {
						unsubscribe = subscribeUnseenCount( wpcom, onCount, undefined, {
							includeNoteContext,
						} );
					}
				} )
				.catch( ( error ) => reportSubscribeError( error, 'unseen_count' ) );
		}

		return () => {
			epoch++;
			unsubscribe?.();
		};
	}, [ subscriberAlertsEnabled, user.ID, onCount, includeNoteContext ] );
}
