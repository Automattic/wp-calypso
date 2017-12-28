/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Main from 'client/components/main';
import LoggedOutFormLinks from 'client/components/logged-out-form/links';
import { recordTracksEvent } from 'client/state/analytics/actions';
import EmptyContent from 'client/components/empty-content';
import HelpButton from './help-button';
import JetpackConnectHappychatButton from './happychat-button';

class NoDirectAccessError extends Component {
	static propTypes = {
		authorizationRemoteQueryData: PropTypes.object,
		recordTracksEvent: PropTypes.func.isRequired,
	};

	handleClickHelp = () => this.props.recordTracksEvent( 'calypso_jpc_help_link_click' );

	render() {
		return (
			<Main className="jetpack-connect__main-error">
				<EmptyContent
					illustration="/calypso/images/illustrations/whoops.svg"
					title={ this.props.translate( 'Oops, this URL should not be accessed directly' ) }
					action={ this.props.translate( 'Get back to Jetpack Connect screen' ) }
					actionURL="/jetpack/connect"
				/>
				<LoggedOutFormLinks>
					<JetpackConnectHappychatButton eventName="calypso_jpc_noqueryarguments_chat_initiated">
						<HelpButton onClick={ this.handleClickHelp } />
					</JetpackConnectHappychatButton>
				</LoggedOutFormLinks>
			</Main>
		);
	}
}

export default connect( null, { recordTracksEvent } )( localize( NoDirectAccessError ) );
