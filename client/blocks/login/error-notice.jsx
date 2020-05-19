/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import config from 'config';

/**
 * Internal dependencies
 */
import {
	getRequestError,
	getTwoFactorAuthRequestError,
	getCreateSocialAccountError,
	getRequestSocialAccountError,
} from 'state/login/selectors';
import Notice from 'components/notice';

class ErrorNotice extends Component {
	static propTypes = {
		createAccountError: PropTypes.object,
		requestAccountError: PropTypes.object,
		requestError: PropTypes.object,
		twoFactorAuthRequestError: PropTypes.object,
	};

	componentDidUpdate( prevProps ) {
		const receiveNewError = ( key ) => this.props[ key ] !== prevProps[ key ];

		if (
			receiveNewError( 'createAccountError' ) ||
			receiveNewError( 'requestAccountError' ) ||
			receiveNewError( 'requestError' ) ||
			receiveNewError( 'twoFactorAuthRequestError' )
		) {
			window.scrollTo( 0, 0 );
		}
	}

	getCreateAccountError() {
		const { createAccountError } = this.props;

		if ( createAccountError && createAccountError.code !== 'unknown_user' ) {
			return createAccountError;
		}

		return null;
	}

	getError() {
		const { requestAccountError, requestError, twoFactorAuthRequestError } = this.props;

		return (
			requestError ||
			twoFactorAuthRequestError ||
			requestAccountError ||
			this.getCreateAccountError()
		);
	}

	render() {
		const error = this.getError();

		if ( ! error || ( error.field && error.field !== 'global' ) || ! error.message ) {
			return null;
		}

		/*
		 * The user_exists error is caught in SocialLoginForm.
		 * The relevant messages are displayed inline in LoginForm.
		 */
		if ( error.code === 'user_exists' ) {
			return null;
		}

		let message = error.message;

		// Account closed error from the API contains HTML, so set a custom message for that case
		if ( error.code === 'deleted_user' ) {
			message = this.props.translate(
				'This account has been closed. ' +
					'If you believe your account was closed in error, please {{a}}contact us{{/a}}.',
				{
					components: {
						a: (
							<a
								href={ config( 'login_url' ) + '?action=recovery' }
								target="_blank"
								rel="noopener noreferrer"
							/>
						),
					},
				}
			);
		}

		return (
			<Notice status="is-error" showDismiss={ false }>
				{ message }
			</Notice>
		);
	}
}

export default connect( ( state ) => ( {
	createAccountError: getCreateSocialAccountError( state ),
	requestAccountError: getRequestSocialAccountError( state ),
	requestError: getRequestError( state ),
	twoFactorAuthRequestError: getTwoFactorAuthRequestError( state ),
} ) )( localize( ErrorNotice ) );
