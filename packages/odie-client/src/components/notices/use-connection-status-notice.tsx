import { HelpCenterSelect } from '@automattic/data-stores';
import { HELP_CENTER_STORE } from '@automattic/help-center/src/stores';
import { useSelect } from '@wordpress/data';
import { Icon, check, warning, info } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { useEffect, useState } from 'react';

type ConnectionStatus = 'connected' | 'reconnecting' | 'disconnected';

export default function useConnectionStatusNotice() {
	const [ shouldWarn, setShouldWarn ] = useState( false );
	const { __ } = useI18n();

	const connectionStatus: ConnectionStatus = useSelect(
		( select ) => ( select( HELP_CENTER_STORE ) as HelpCenterSelect ).getZendeskConnectionStatus(),
		[]
	);

	useEffect( () => {
		if ( connectionStatus === 'disconnected' ) {
			setShouldWarn( true );
		}
	}, [ connectionStatus ] );

	if ( ! shouldWarn ) {
		return undefined;
	}

	const connectionStatusMap = {
		disconnected: {
			icon: <Icon size={ 24 } icon={ warning } />,
			message: __( 'Chat connection lost.', __i18n_text_domain__ ),
			status: 'error' as const,
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
