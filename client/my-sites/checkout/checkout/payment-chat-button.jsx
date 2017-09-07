/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import HappychatButton from 'components/happychat/button';

export default localize( ( { translate } ) => {
	return (
		<HappychatButton className="checkout__payment-chat-button">
				<Gridicon icon="chat" className="checkout__payment-chat-button-icon" />
				{ translate( 'Need help? Chat with us' ) }
		</HappychatButton>
	);
} );
