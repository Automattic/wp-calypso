import { HelpCenterSelect } from '@automattic/data-stores';
import { HELP_CENTER_STORE } from '@automattic/help-center/src/stores';
import { Notice } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import './styles.scss';
import { useEffect, useState } from 'react';

const connectionStatusMap = {
	disconnected: {
		status: 'error',
		message: 'We lost connection to chat support.',
	},
	reconnecting: {
		status: 'warning',
		message: 'Reconnecting to chat support...',
	},
	connected: {
		status: 'success',
		message: 'Connected!',
	},
} as const;

export const ConnectionStatus = () => {
	const [ expired, setExpired ] = useState( false );

	const connectionStatus = useSelect(
		( select ) => ( select( HELP_CENTER_STORE ) as HelpCenterSelect ).getZendeskConnectionStatus(),
		[]
	);

	useEffect( () => {
		if ( connectionStatus === 'connected' ) {
			setTimeout( () => {
				setExpired( true );
			}, 2000 );
		} else {
			setExpired( false );
		}
	}, [ connectionStatus ] );

	if ( expired ) {
		return null;
	}

	return (
		<Notice
			isDismissible={ false }
			status={ connectionStatusMap[ connectionStatus ].status }
			className="odie-connection-status--notice"
		>
			{ connectionStatusMap[ connectionStatus ].message }
		</Notice>
	);
};
