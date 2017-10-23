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
import { isEnabled } from 'config';
import { getCurrentUserId } from 'state/current-user/selectors';
import { hasActiveHappychatSession } from 'state/happychat/selectors';
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
				// TODO: why was HappychatConnection here?
				{ children }
			</div>
		);
	}

	return (
		<HappychatButton
			className="logged-out-form__link-item jetpack-connect__happychat-button"
			borderless={ false }
		>
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
