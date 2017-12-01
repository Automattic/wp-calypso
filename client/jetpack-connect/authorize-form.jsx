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
import { getAuthorizationRemoteQueryData } from 'state/jetpack-connect/selectors';
import { getCurrentUserId } from 'state/current-user/selectors';
import { recordTracksEvent, setTracksAnonymousUserId } from 'state/analytics/actions';
import MainWrapper from './main-wrapper';
import LoggedInForm from './auth-logged-in-form';
import LoggedOutForm from './auth-logged-out-form';

class JetpackConnectAuthorizeForm extends Component {
	static propTypes = {
		authorizationRemoteQueryData: PropTypes.shape( {
			_ui: PropTypes.string,
			_ut: PropTypes.string,
		} ).isRequired,
		isLoggedIn: PropTypes.bool.isRequired,
		recordTracksEvent: PropTypes.func.isRequired,
		setTracksAnonymousUserId: PropTypes.func.isRequired,
	};

	componentWillMount() {
		// set anonymous ID for cross-system analytics
		const { authorizationRemoteQueryData } = this.props;
		if (
			authorizationRemoteQueryData &&
			authorizationRemoteQueryData._ui &&
			'anon' === authorizationRemoteQueryData._ut
		) {
			this.props.setTracksAnonymousUserId( authorizationRemoteQueryData._ui );
		}
		this.props.recordTracksEvent( 'calypso_jpc_authorize_form_view' );
	}

	handleClickHelp = () => {
		this.props.recordTracksEvent( 'calypso_jpc_help_link_click' );
	};

	renderForm() {
		return this.props.isLoggedIn ? (
			<LoggedInForm />
		) : (
			<LoggedOutForm local={ this.props.locale } path={ this.props.path } />
		);
	}

	render() {
		return (
			<MainWrapper>
				<div className="jetpack-connect__authorize-form">{ this.renderForm() }</div>
			</MainWrapper>
		);
	}
}

export { JetpackConnectAuthorizeForm as JetpackConnectAuthorizeFormTestComponent };

export default connect(
	state => ( {
		authorizationRemoteQueryData: getAuthorizationRemoteQueryData( state ),
		isLoggedIn: !! getCurrentUserId( state ),
	} ),
	{
		recordTracksEvent,
		setTracksAnonymousUserId,
	}
)( localize( JetpackConnectAuthorizeForm ) );
