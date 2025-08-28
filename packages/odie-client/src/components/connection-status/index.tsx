import { HelpCenterSelect } from '@automattic/data-stores';
import { HELP_CENTER_STORE } from '@automattic/help-center/src/stores';
import { Notice } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import { useEffect, useState } from 'react';

export const ConnectionStatus = () => {
	const [ shouldWarn, setShouldWarn ] = useState( false );
	const { __ } = useI18n();

	const connectionStatusMap = {
		disconnected: {
			status: 'error',
			message: __( 'Chat connection lost.', __i18n_text_domain__ ),
		},
		reconnecting: {
			status: 'warning',
			message: __( 'Reconnecting…', __i18n_text_domain__ ),
		},
		connected: {
			status: 'success',
			message: __( 'You’re back online with support.', __i18n_text_domain__ ),
		},
	} as const;

	const connectionStatus = useSelect(
		( select ) => ( select( HELP_CENTER_STORE ) as HelpCenterSelect ).getZendeskConnectionStatus(),
		[]
	);

	useEffect( () => {
		if ( connectionStatus === 'disconnected' ) {
			setShouldWarn( true );
		}
	}, [ connectionStatus ] );

	if ( ! shouldWarn ) {
		return null;
	}

	return (
		<Notice
			isDismissible={ connectionStatus === 'connected' }
			status={ connectionStatusMap[ connectionStatus ].status }
			className="odie-connection-status--notice"
			onDismiss={ () => setShouldWarn( false ) }
		>
			{ connectionStatusMap[ connectionStatus ].message }
		</Notice>
	);
};
