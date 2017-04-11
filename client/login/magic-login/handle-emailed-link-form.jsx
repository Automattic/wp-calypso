/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';
import { connect } from 'react-redux';
import emailValidator from 'email-validator';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import EmptyContent from 'components/empty-content';
import config from 'config';
import { localize } from 'i18n-calypso';
import {
	fetchMagicLoginAuthenticate,
	showMagicLoginLinkExpiredPage,
} from 'state/login/magic-login/actions';
import {
	getMagicLoginRequestAuthError,
	getMagicLoginRequestedAuthSuccessfully,
	isFetchingMagicLoginAuth,
} from 'state/selectors';
import { getCurrentUser } from 'state/current-user/selectors';
import { getCurrentQueryArguments } from 'state/ui/selectors';

class HandleEmailedLinkForm extends React.Component {
	state = {
		hasSubmitted: false,
	};

	handleSubmit = event => {
		event.preventDefault();

		this.setState( {
			hasSubmitted: true,
		} );

		this.props.fetchMagicLoginAuthenticate( this.props.emailAddress, this.props.token, this.props.tokenTime );
	};

	componentWillMount() {
		const { emailAddress, token, tokenTime } = this.props;

		if ( emailAddress && emailValidator.validate( emailAddress ) && token && tokenTime ) {
			return;
		}

		this.props.showMagicLoginLinkExpiredPage();
	}

	componentWillUpdate( nextProps, nextState ) {
		if ( ! nextState.hasSubmitted ) {
			return;
		}

		if ( nextProps.authError ) {
			// @TODO if this is a 5XX, or timeout, show an error...?
			this.props.showMagicLoginLinkExpiredPage();
			return;
		}

		if ( nextProps.isAuthenticated ) {
			// @TODO avoid full reload
			window.location.replace( '/' );
			return;
		}
	}

	render() {
		const {
			currentUser,
			emailAddress,
			isFetching,
			translate,
		} = this.props;

		const action = (
			<Button primary disabled={ this.state.hasSubmitted } onClick={ this.handleSubmit }>
				{ translate( 'Finish Login' ) }
			</Button>
		);
		const title =
			this.props.clientId === config( 'wpcom_signup_id' )
				? translate( 'Continue to WordPress.com' )
				: translate( 'Continue to WordPress.com on your WordPress app' );
		const line = [
			translate(
				'Logging in as %(emailAddress)s', {
					args: {
						emailAddress,
					}
				}
			)
		];

		if ( currentUser && currentUser.username ) {
			line.push( <p>{
				translate( 'NOTE: You are already logged in as user: %(user)s', {
					args: {
						user: currentUser.username,
					}
				} ) }<br />
				{ translate( 'Continuing will switch users.' ) }
				</p> );
		}

		return (
			<EmptyContent
				action={ action }
				className={ classNames( {
					'magic-login__is-fetching-auth': isFetching,
				} ) }
				illustration={ '/calypso/images/drake/drake-nosites.svg' }
				illustrationWidth={ 500 }
				line={ line }
				title={ title }
				/>
		);
	}
}

const mapState = state => {
	const queryArguments = getCurrentQueryArguments( state );
	const {
		client_id: clientId,
		email: emailAddress,
		token,
		tt: tokenTime
	} = queryArguments;

	return {
		authError: getMagicLoginRequestAuthError( state ),
		isAuthenticated: getMagicLoginRequestedAuthSuccessfully( state ),
		isFetching: isFetchingMagicLoginAuth( state ),
		currentUser: getCurrentUser( state ),
		clientId,
		emailAddress,
		token,
		tokenTime,
	};
};

const mapDispatch = {
	fetchMagicLoginAuthenticate,
	showMagicLoginLinkExpiredPage,
};

export default connect( mapState, mapDispatch )( localize( HandleEmailedLinkForm ) );
