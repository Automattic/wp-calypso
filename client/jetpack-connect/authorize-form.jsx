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
import MainWrapper from './main-wrapper';
import { getCurrentUserId } from 'state/current-user/selectors';

class JetpackConnectAuthorizeForm extends Component {
	static propTypes = {
		// Connected props
		isLoggedIn: PropTypes.bool.isRequired,
	};

	renderForm() {
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

	render() {
		return (
			<MainWrapper>
				<div className="jetpack-connect__authorize-form">{ this.renderForm() }</div>
			</MainWrapper>
		);
	}
}

export { JetpackConnectAuthorizeForm as JetpackConnectAuthorizeFormTestComponent };

export default connect( state => ( {
	isLoggedIn: !! getCurrentUserId( state ),
} ) )( localize( JetpackConnectAuthorizeForm ) );
