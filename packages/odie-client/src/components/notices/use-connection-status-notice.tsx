import { HelpCenterSelect } from '@automattic/data-stores';
import { HELP_CENTER_STORE } from '@automattic/help-center/src/stores';
import { useSelect } from '@wordpress/data';
import { Icon, check, info } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { useEffect, useState } from 'react';

const WARNING_THRESHOLD = 15; // seconds

export default function useConnectionStatusNotice( isLiveChat: boolean = false ) {
	const [ shouldWarn, setShouldWarn ] = useState( false );
	const [ secondsSinceDisconnected, setSecondsSinceDisconnected ] = useState( 0 );
	const { __ } = useI18n();

	const connectionStatus = useSelect(
		( select ) => ( select( HELP_CENTER_STORE ) as HelpCenterSelect ).getZendeskConnectionStatus(),
		[]
	);

	useEffect( () => {
		if ( connectionStatus === 'disconnected' ) {
			const connectionTimeout = setTimeout( () => {
				setSecondsSinceDisconnected( secondsSinceDisconnected + 1 );
				if ( secondsSinceDisconnected >= WARNING_THRESHOLD ) {
					setShouldWarn( true );
				}
			}, 1000 );
			return () => clearTimeout( connectionTimeout );
		} else if ( connectionStatus === 'connected' ) {
			setSecondsSinceDisconnected( 0 );
			// Show the "Connected" notice for 2 seconds then auto-hide it.
			const hidingReconnectedTimeout = setTimeout( setShouldWarn, 2000, false );
			return () => clearTimeout( hidingReconnectedTimeout );
		}
	}, [ connectionStatus, secondsSinceDisconnected ] );

	if ( secondsSinceDisconnected < WARNING_THRESHOLD && connectionStatus !== 'connected' ) {
		return undefined;
	}

	if ( ! isLiveChat || ! shouldWarn || ! connectionStatus ) {
		return undefined;
	}

	const connectionStatusMap = {
		disconnected: {
			icon: <Icon size={ 24 } icon={ info } />,
			message: __( 'Unstable internet connection.', __i18n_text_domain__ ),
			status: 'warning' as const,
			dismissible: false,
		},
		reconnecting: {
			icon: <Icon size={ 24 } icon={ info } />,
			message: __( 'Reconnecting…', __i18n_text_domain__ ),
			status: 'warning' as const,
			dismissible: false,
		},
		connected: {
			icon: <Icon size={ 24 } icon={ check } />,
			message: __( "You're back online with support.", __i18n_text_domain__ ),
			status: 'success' as const,
			dismissible: true,
			onDismiss: () => setShouldWarn( false ),
		},
	};

	return connectionStatusMap[ connectionStatus ];
}
