/**
 * External dependencies
 */
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';
import React from 'react';

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
