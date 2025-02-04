import { usePrevious } from '@wordpress/compose';
import { useCallback, useEffect, useRef } from 'react';
import AsyncLoad from 'calypso/components/async-load';
import { useSelector, useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import getUnseenCount from 'calypso/state/selectors/get-notification-unseen-count';
import getIsNotificationsOpen from 'calypso/state/selectors/is-notifications-open';
import { toggleNotificationsPanel } from 'calypso/state/ui/actions';
import type { AppState } from 'calypso/types';
import './style.scss';

const GlobalNotifications = () => {
	const isNotificationsOpen = useSelector( ( state: AppState ) => getIsNotificationsOpen( state ) );
	const isNotificationsOpenRef = useRef( isNotificationsOpen );
	const prevIsNotificationsOpen = usePrevious( isNotificationsOpen );
	const unseenCount = useSelector( ( state: AppState ) => getUnseenCount( state ) );
	const containerRef = useRef< HTMLDivElement >( null );
	const currentRoute = useSelector( getCurrentRoute );
	const dispatch = useDispatch();
	const toggleNotesFrame = useCallback( ( event: MouseEvent | null ) => {
		if ( event ) {
			event.preventDefault && event.preventDefault();
			event.stopPropagation && event.stopPropagation();
		}
		// Get URL and if it matches "/read/notifications", don't open the panel
		// As it will cause duplicate notification panels to show
		if ( window.location.pathname === '/read/notifications' ) {
			return;
		}

		dispatch( toggleNotificationsPanel() );
	}, [] );

	// This toggle gets called both on the calypso and panel sides. Throttle it to prevent calls on
	// both sides from conflicting and cancelling each other out.
	const checkToggleNotes = useCallback(
		( event: MouseEvent | null, forceToggle = false, forceOpen = false ) => {
			const target = event ? event.target : false;

			// Ignore clicks or other events which occur inside of the notification panel.
			if ( target && containerRef.current?.contains( target as Node ) ) {
				return;
			}

			// Prevent toggling closed if we are opting to open.
			if ( forceOpen && isNotificationsOpenRef.current ) {
				return;
			}

			if ( isNotificationsOpenRef.current || forceToggle === true || forceOpen === true ) {
				toggleNotesFrame( event );
			}
		},
		[ containerRef, isNotificationsOpenRef, toggleNotesFrame ]
	);

	isNotificationsOpenRef.current = isNotificationsOpen;

	/**
	 * Record the unseen count when the notification opens.
	 */
	useEffect( () => {
		if ( ! prevIsNotificationsOpen && isNotificationsOpen ) {
			dispatch(
				recordTracksEvent( 'calypso_notification_open', {
					unread_notifications: unseenCount,
				} )
			);
		}
	}, [ prevIsNotificationsOpen, isNotificationsOpen, unseenCount, dispatch ] );

	// Get URL and if it matches "/read/notifications", don't render the global notifications panel.
	// As it will cause duplicate notification store listeners to be registered.
	if ( currentRoute === '/read/notifications' ) {
		return null;
	}

	return (
		<div className="global-notifications" ref={ containerRef }>
			<AsyncLoad
				require="calypso/notifications"
				isShowing={ isNotificationsOpen }
				checkToggle={ checkToggleNotes }
				placeholder={ null }
			/>
		</div>
	);
};

export default GlobalNotifications;
