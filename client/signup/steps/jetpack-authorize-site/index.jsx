/**
 * Externals dependencies
 */
import React from 'react';
import Debug from 'debug';

/**
 * Internal dependencies
 */
import StepWrapper from 'signup/step-wrapper';
import wpcom from 'lib/wp';

/**
 * Module variables
 */
const debug = new Debug( 'calypso:jetpack-authorize' );

module.exports = React.createClass( {
	displayName: 'JetpackAuthorizeSite',

	getInitialState() {
		return {
			isSubmitting: false,
			authorizeError: false,
			authorizeSuccess: false
		};
	},

	getHeaderText() {
		return this.translate( 'Howdy! Jetpack would like to connect to your WordPress.com account.' );
	},

	getSubHeaderText() {
		return this.translate( 'Because Jetpack is awesome.' );
	},

	handleSubmit() {
		const { queryObject } = this.props;
		debug( 'trying jetpack login', queryObject );
		this.setState( { isSubmitting: true, authorizeError: false } );
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
			return <p>Error connecting. Run `localStorage.setItem( 'debug', 'calypso:jetpack-authorize' );` and try again.</p>;
		}
		return null;
	},

	renderForm() {
		if ( this.state.authorizeSuccess ) {
			return <p>Jetpack Connected!</p>;
		}

		return(
			<div>
				<button disabled={ this.state.isSubmitting } onClick={ this.handleSubmit } className="button is-primary">
					{ this.translate( 'Approve' ) }
				</button>
				{ this.renderErrorMessage() }
			</div>
		);
	},

	render() {
		return(
			<StepWrapper
				flowName={ this.props.flowName }
				stepName={ this.props.stepName }
				headerText={ this.getHeaderText() }
				subHeaderText={ this.getSubHeaderText() }
				positionInFlow={ this.props.positionInFlow }
				signupProgressStore={ this.props.signupProgressStore }
				stepContent={ this.renderForm() } />
		);
	}
} );
