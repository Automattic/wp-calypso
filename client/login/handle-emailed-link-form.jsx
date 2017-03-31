/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import emailValidator from 'email-validator';
import request from 'superagent';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import EmptyContent from 'components/empty-content';

import config from 'config';
import debugFactory from 'debug';
import { getCurrentUser } from 'state/current-user/selectors';
import { getCurrentQueryArguments } from 'state/ui/selectors';
import { localize } from 'i18n-calypso';

const debug = debugFactory( 'calypso:magic-login' );

/**
 * Provide the "Magic Login" token to get logged in (or get the credentials to do so ourself)
 * @param  {object} data - object containing an email address & token
 * @param  {Function} fn - Function to invoke when request is complete
 * @returns {Promise} promise
 */
function postToMagicLoginTokenHandler( data ) {
	data.client_id = config( 'wpcom_signup_id' );
	data.client_secret = config( 'wpcom_signup_key' );

	return request
		.post( 'https://wordpress.com/wp-login.php?action=magic-login' )
		.withCredentials()
		.send( data )
		.set( {
			Accept: 'application/json',
			'Content-Type': 'application/x-www-form-urlencoded',
		} )
		.end( responseHandler );
}

function responseHandler( error, response ) {
	response = response || {};

	const { status, body } = response;

	if ( ! status || 400 <= status && status < 500 ) {
		debug( 'unsuccessful status: ' + status );
		window.location.replace( '/login/link-has-expired' );
		return;
	}

	if ( error || ! ( body && body.data && body.success ) ) {
		debug( 'error: ' + JSON.stringify( error ) );
		debug( 'body: ' + JSON.stringify( body ) );

		// @TODO This is most likely a server or network error, maybe show a notice instead?
		window.location.replace( '/login/link-has-expired' );
		return;
	}

	const { data } = body;
	const { redirect_to } = data;

	if ( redirect_to.match( /^(https:\/\/wordpress\.com|http:\/\/calypso\.localhost:3000)(\/|$)/ ) ) {
		debug( 'redirecting: ' + redirect_to );
		window.location.replace( redirect_to );
	} else {
		window.location.replace( '/' );
	}
}

class HandleEmailedLinkForm extends React.Component {
	state = {
		hasSubmitted: false,
	};

	handleSubmit = event => {
		event.preventDefault();

		debug( 'form submitted!' );

		this.setState( {
			hasSubmitted: true,
		} );

		const postData = {
			email: this.props.emailAddress,
			token: this.props.token,
			tt: this.props.tokenTime,
		};

		debug( '`POST`ing credentials to WPCOM', postData );

		postToMagicLoginTokenHandler( postData );
	};

	componentWillMount() {
		const { emailAddress, token, tokenTime } = this.props;

		if ( emailAddress && emailValidator.validate( emailAddress ) && token && tokenTime ) {
			return;
		}

		window.location.replace( '/login/link-has-expired' );
	}

	render() {
		const { currentUser, emailAddress, translate } = this.props;
		const action = (
			<Button primary disabled={ !! this.state.hasSubmitted } onClick={ this.handleSubmit }>
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
		currentUser: getCurrentUser( state ),
		clientId,
		emailAddress,
		token,
		tokenTime,
	};
};

export default connect( mapState )( localize( HandleEmailedLinkForm ) );
