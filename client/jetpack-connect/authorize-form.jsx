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
import LoggedInForm from './auth-logged-in-form';
import LoggedOutForm from './auth-logged-out-form';
import { getCurrentUserId } from 'state/current-user/selectors';

class JetpackConnectAuthorizeForm extends Component {
	static propTypes = {
		// Connected props
		isLoggedIn: PropTypes.bool.isRequired,
	};

	render() {
		return this.props.isLoggedIn ? (
			<LoggedInForm authQuery={ this.props.authQuery } />
		) : (
			<LoggedOutForm
				local={ this.props.locale }
				path={ this.props.path }
				authQuery={ this.props.authQuery }
			/>
		);
	}
}

export { JetpackConnectAuthorizeForm as JetpackConnectAuthorizeFormTestComponent };

export default connect( state => ( {
	isLoggedIn: !! getCurrentUserId( state ),
} ) )( localize( JetpackConnectAuthorizeForm ) );
