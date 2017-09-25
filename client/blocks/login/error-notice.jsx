/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Notice from 'components/notice';
import { getRequestError, getTwoFactorAuthRequestError, getCreateSocialAccountError, getRequestSocialAccountError } from 'state/login/selectors';

class ErrorNotice extends Component {
	static propTypes = {
		createAccountError: PropTypes.object,
		requestAccountError: PropTypes.object,
		requestError: PropTypes.object,
		twoFactorAuthRequestError: PropTypes.object,
	};

	componentWillReceiveProps = ( nextProps ) => {
		const receiveNewError = ( key ) => {
			return this.props[ key ] !== nextProps[ key ];
		};

		if (
			receiveNewError( 'createAccountError' ) ||
			receiveNewError( 'requestAccountError' ) ||
			receiveNewError( 'requestError' ) ||
			receiveNewError( 'twoFactorAuthRequestError' )
		) {
			window.scrollTo( 0, 0 );
		}
	};

	getCreateAccountError() {
		const { createAccountError } = this.props;

		if ( createAccountError && createAccountError.code !== 'unknown_user' ) {
			return createAccountError;
		}

		return null;
	}

	getError() {
		const { requestAccountError, requestError, twoFactorAuthRequestError } = this.props;

		return requestError || twoFactorAuthRequestError || requestAccountError || this.getCreateAccountError();
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

		return (
			<Notice status={ 'is-error' } showDismiss={ false }>
				{ error.message }
			</Notice>
		);
	}
}

export default connect(
	( state ) => ( {
		createAccountError: getCreateSocialAccountError( state ),
		requestAccountError: getRequestSocialAccountError( state ),
		requestError: getRequestError( state ),
		twoFactorAuthRequestError: getTwoFactorAuthRequestError( state ),
	} )
)( ErrorNotice );
