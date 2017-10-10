/**
 * External dependencies
 *
 * @format
 */

import React from 'react';
import Gridicon from 'gridicons';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import HappychatButton from 'components/happychat/button';
import HappychatConnection from 'components/happychat/connection';
import { isEnabled } from 'config';
import { hasActiveHappychatSession } from 'state/happychat/selectors';
import isHappychatAvailable from 'state/happychat/selectors/is-happychat-available';

const JetpackConnectHappychatButton = ( {
	children,
	isChatActive,
	isChatAvailable,
	translate,
} ) => {
	if ( ! isEnabled( 'jetpack/happychat' ) ) {
		return (
			<div>
				{ children }
			</div>
		);
	}

	if ( ! isChatAvailable && ! isChatActive ) {
		return (
			<div>
				<HappychatConnection />
				{ children }
			</div>
		);
	}

	return (
		<HappychatButton
			className="logged-out-form__link-item jetpack-connect__happychat-button"
			borderless={ false }
		>
			<HappychatConnection />
			<Gridicon icon="chat" /> { translate( 'Get help connecting your site' ) }
		</HappychatButton>
	);
};

export default connect( state => ( {
	isChatAvailable: isHappychatAvailable( state ),
	isChatActive: hasActiveHappychatSession( state ),
} ) )( localize( JetpackConnectHappychatButton ) );
