/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import SocialLogo from 'social-logos';
import { loadScript } from 'lib/load-script';

export default class GoogleLoginButton extends Component {
	static propTypes = {
		clientId: PropTypes.string.isRequired,
		scope: PropTypes.string,
		fetchBasicProfile: PropTypes.bool,
		responseHandler: PropTypes.func.isRequired,
	};

	static defaultProps = {
		scope: 'profile',
		fetchBasicProfile: true,
	};

	constructor( props ) {
		super( props );
		this.googleAuth = null;
		this.handleClick = this.handleClick.bind( this );
	}

	componentWillMount() {
		this.loadGoogleAuth();
	}

	loadDependency() {
		if ( window.gapi ) {
			return Promise.resolve( window.gapi );
		}

		return new Promise( resolve => {
			loadScript( 'https://apis.google.com/js/platform.js', () => resolve( window.gapi ) );
		} );
	}

	loadGoogleAuth() {
		return new Promise( resolve => {
			if ( this.googleAuth ) {
				return resolve(); // we cannot pass `this.googleAuth` as argument is because it's a thenable
			}

			this.loadDependency().then( gapi => {
				gapi.load( 'auth2', () => {
					this.googleAuth = gapi.auth2.init( {
						client_id: this.props.clientId,
						scope: this.props.scope,
						fetch_basic_profile: this.props.fetchBasicProfile,
					} );
					resolve();
				} );
			} );
		} );
	}

	handleClick() {
		const { responseHandler } = this.props;

		// Handle click async if the library is not loaded yet
		// the popup might be blocked by the browser in that case
		this.loadGoogleAuth().then( () => {
			this.googleAuth.signIn().then( googleUser => {
				responseHandler( googleUser );
			} );
		} );
	}

	render() {
		return (
			<button className="button" onClick={ this.handleClick }>
				<span>
					<SocialLogo className="social-buttons__logo" icon="google" size={ 24 } />
					<span className="social-buttons__service-name">
						Google
					</span>
				</span>
			</button>
		);
	}
}
