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
import { authQueryPropTypes } from './utils';
import { getCurrentUserId } from 'state/current-user/selectors';
import { recordTracksEvent, setTracksAnonymousUserId } from 'state/analytics/actions';

class JetpackConnectAuthorizeForm extends Component {
	static propTypes = {
		authQuery: authQueryPropTypes.isRequired,

		// Connected props
		isLoggedIn: PropTypes.bool.isRequired,
		recordTracksEvent: PropTypes.func.isRequired,
		setTracksAnonymousUserId: PropTypes.func.isRequired,
	};

	componentWillMount() {
		// set anonymous ID for cross-system analytics
		const { tracksUi, tracksUt } = this.props.authQuery;
		if ( 'anon' === tracksUt && tracksUi ) {
			this.props.setTracksAnonymousUserId( tracksUi );
		}
		this.props.recordTracksEvent( 'calypso_jpc_authorize_form_view' );
	}

	handleClickHelp = () => {
		this.props.recordTracksEvent( 'calypso_jpc_help_link_click' );
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

export default connect(
	state => ( {
		isLoggedIn: !! getCurrentUserId( state ),
	} ),
	{
		recordTracksEvent,
		setTracksAnonymousUserId,
	}
)( localize( JetpackConnectAuthorizeForm ) );
