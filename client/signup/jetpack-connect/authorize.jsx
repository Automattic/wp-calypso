/**
 * External dependencies
 */
import React from 'react';
import Debug from 'debug';

/**
 * Internal dependencies
 */
import ConnectHeader from './connect-header';
import Main from 'components/main';
import wpcom from 'lib/wp';

/**
 * Module variables
 */
const debug = new Debug( 'calypso:jetpack-connect-authorize' );

export default React.createClass( {
	displayName: 'JetpackConnectAuthorize',

	getInitialState() {
		return {
			isSubmitting: false,
			authorizeError: false,
			authorizeSuccess: false
		};
	},

	handleSubmit() {
		const { queryObject } = this.props;
		debug( 'trying jetpack login', queryObject );
		this.setState( { isSubmitting: true, authorizeError: false } );

		if ( 1 === this.props.positionInFlow ) {
			queryObject._wp_nonce = this.props.signupDependencies._wp_nonce;
		}

		wpcom.undocumented().jetpackLogin( queryObject, this.handleJetpackLoginComplete );
	},

	handleJetpackLoginComplete( error, data ) {
		const { queryObject } = this.props;
		if ( error ) {
			debug( 'jetpack login error', error );
			this.setState( { authorizeError: true, isSubmitting: false } );
			return;
		}
		debug( 'jetpack login success. trying jetpack authorize.', queryObject.client_id, data );
		wpcom.undocumented().jetpackAuthorize( queryObject.client_id, data.code, queryObject.state, queryObject.redirect_uri, queryObject.secret, this.handleAuthorizeComplete );
	},

	handleAuthorizeComplete( error, data ) {
		if ( error ) {
			debug( 'jetpack authorize error', error );
			console.log( error );
			this.setState( { authorizeError: true, isSubmitting: false } );
			return;
		}

		debug( 'authorization complete!', data );
		this.setState( { isSubmitting: false, authorizeSuccess: true } );
	},

	renderErrorMessage() {
		if ( this.state.authorizeError ) {
			return <p>Error connecting. Run `localStorage.setItem( 'debug', 'calypso:jetpack-connect-authorize' );` and try again.</p>;
		}
		return null;
	},

	renderButton() {
		if ( this.state.authorizeSuccess ) {
			return <p>Jetpack Connected!</p>;
		}

		return (
			<button disabled={ this.state.isSubmitting } onClick={ this.handleSubmit } className="button is-primary">
				{ this.translate( 'Approve' ) }
			</button>
		);
	},

	render() {
		return (
			<Main className="jetpack-connect">

				<div className="jetpack-connect__site-url-entry-container">
					<ConnectHeader headerText={ this.translate( 'Connect a self-hosted WordPress' ) }
						subHeaderText={ this.translate( 'Jetpack would like to connect to your WordPress.com account' ) }
						step={ 1 }
						steps={ 3 } />
					{ this.renderButton() }
					{ this.renderErrorMessage() }
				</div>
			</Main>
		);
	}
} );
