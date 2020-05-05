/**
 * External dependencies
 */
import React from 'react';
import Gridicon from 'components/gridicon';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { recordTracksEvent } from 'lib/analytics/tracks';
import HappychatButton from 'components/happychat/button';
import HappychatConnection from 'components/happychat/connection-connected';
import { isEnabled } from 'config';
import { getCurrentUserId } from 'state/current-user/selectors';
import hasActiveHappychatSession from 'state/happychat/selectors/has-active-happychat-session';
import isHappychatAvailable from 'state/happychat/selectors/is-happychat-available';

const getHappyChatButtonClickHandler = ( eventName = 'calypso_jpc_chat_initiated' ) => () =>
	recordTracksEvent( eventName );

const JetpackConnectHappychatButton = ( {
	children,
	isChatActive,
	isChatAvailable,
	isLoggedIn,
	label,
	translate,
	eventName,
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
			borderless={ false }
			className="logged-out-form__link-item jetpack-connect__happychat-button"
			onClick={ getHappyChatButtonClickHandler( eventName ) }
		>
			<HappychatConnection />
			<Gridicon icon="chat" size={ 18 } /> { label || translate( 'Get help setting up Jetpack' ) }
		</HappychatButton>
	);
};

JetpackConnectHappychatButton.propTypes = {
	eventName: PropTypes.string,
	label: PropTypes.string,
};

export default connect( ( state ) => ( {
	isChatAvailable: isHappychatAvailable( state ),
	isChatActive: hasActiveHappychatSession( state ),
	isLoggedIn: Boolean( getCurrentUserId( state ) ),
} ) )( localize( JetpackConnectHappychatButton ) );
