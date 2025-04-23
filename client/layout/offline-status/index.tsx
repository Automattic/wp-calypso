import { useTranslate } from 'i18n-calypso';
import { useEffect, useRef } from 'react';
import { useNetworkConnection } from 'calypso/lib/network-connection';
import { useDispatch } from 'calypso/state';
import { warningNotice, successNotice, removeNotice } from 'calypso/state/notices/actions';
import './style.scss';

function OfflineStatus() {
	const { isOnline } = useNetworkConnection();
	const prevIsOnline = useRef( isOnline );
	const dispatch = useDispatch();
	const translate = useTranslate();

	useEffect( () => {
		if ( isOnline === prevIsOnline.current ) {
			return;
		}

		if ( isOnline ) {
			dispatch( removeNotice( 'connectionLost' ) );
			dispatch(
				successNotice( translate( 'Connection restored.' ), {
					showDismiss: true,
					isPersistent: true,
					id: 'connectionRestored',
					duration: 5000,
				} )
			);
		} else {
			dispatch( removeNotice( 'connectionRestored' ) );
			dispatch(
				warningNotice( translate( 'Not connected. Some information may be out of sync.' ), {
					showDismiss: true,
					isPersistent: true,
					id: 'connectionLost',
					duration: 5000,
				} )
			);
		}

		prevIsOnline.current = isOnline;
	}, [ isOnline, dispatch, translate ] );

	if ( isOnline ) {
		return null;
	}

	return (
		<span className="offline-status">
			<svg
				className="gridicon"
				height={ 18 }
				width={ 18 }
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 24 24"
			>
				<g>
					<path d="M12.736 3.184L7.834 12.57l5.106.035-2.592 7.904 7.265-10.502-5.65.083.773-6.906z" />
				</g>
			</svg>
			Offline
		</span>
	);
}

export default OfflineStatus;
