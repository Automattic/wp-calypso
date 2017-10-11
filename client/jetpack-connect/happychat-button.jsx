/**
 * External dependencies
 *
 * @format
 */

import React from 'react';
import Gridicon from 'gridicons';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import HappychatButton from 'components/happychat/button';
import HappychatConnection from 'components/happychat/connection';
import { isEnabled } from 'config';
import { getCurrentUserId } from 'state/current-user/selectors';
import hasActiveHappychatSession from 'state/happychat/selectors/has-active-happychat-session';
import isHappychatAvailable from 'state/happychat/selectors/is-happychat-available';

const JetpackConnectHappychatButton = ( {
	children,
	isChatActive,
	isChatAvailable,
	isLoggedIn,
	label,
	translate,
} ) => {
	if ( ! isEnabled( 'jetpack/happychat' ) || ! isLoggedIn ) {
		return <div>{ children }</div>;
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
			<Gridicon icon="chat" /> { label || translate( 'Get help connecting your site' ) }
		</HappychatButton>
	);
};

JetpackConnectHappychatButton.propTypes = {
	label: PropTypes.string,
};

export default connect( state => ( {
	isChatAvailable: isHappychatAvailable( state ),
	isChatActive: hasActiveHappychatSession( state ),
	isLoggedIn: Boolean( getCurrentUserId( state ) ),
} ) )( localize( JetpackConnectHappychatButton ) );
