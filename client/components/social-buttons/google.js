/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { loadScript } from 'lib/load-script';
import { localize } from 'i18n-calypso';

class GoogleLoginButton extends Component {
	static propTypes = {
		clientId: PropTypes.string.isRequired,
		scope: PropTypes.string,
		fetchBasicProfile: PropTypes.bool,
		responseHandler: PropTypes.func.isRequired,
		translate: PropTypes.func.isRequired
	};

	static defaultProps = {
		scope: 'https://www.googleapis.com/auth/plus.login',
		fetchBasicProfile: true,
	};

	constructor( props ) {
		super( props );

		this.initialized = null;
		this.handleClick = this.handleClick.bind( this );
	}

	componentWillMount() {
		this.initialize();
	}

	loadDependency() {
		if ( window.gapi ) {
			return Promise.resolve( window.gapi );
		}

		return new Promise( resolve => {
			loadScript( 'https://apis.google.com/js/api.js', () => resolve( window.gapi ) );
		} );
	}

	initialize() {
		if ( this.initialized ) {
			return this.initialized;
		}

		this.initialized = this.loadDependency()
			.then( gapi => new Promise( resolve => gapi.load( 'client:auth2', resolve ) ).then( () => gapi ) )
			.then( gapi => gapi.client.init( {
				client_id: this.props.clientId,
				scope: this.props.scope,
				fetch_basic_profile: this.props.fetchBasicProfile,
			} )
			.then( () => gapi ) // don't try to return gapi.auth2.getAuthInstance() here, it has a `then` method
			).catch( error => {
				this.initialized = null;

				return Promise.reject( error );
			} );

		return this.initialized;
	}

	handleClick( event ) {
		event.preventDefault();

		const { responseHandler } = this.props;

		// Handle click async if the library is not loaded yet
		// the popup might be blocked by the browser in that case
		this.initialize().then( gapi => gapi.auth2.getAuthInstance().signIn().then( responseHandler ) );
	}

	render() {
		return (
			<button className="button" onClick={ this.handleClick }>
				<svg className="social-buttons__logo" width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
					{ /* eslint-disable max-len */ }
					<g fill="none" fillRule="evenodd">
						<path d="M19.6 10.227c0-.709-.064-1.39-.182-2.045H10v3.868h5.382a4.6 4.6 0 0 1-1.996 3.018v2.51h3.232c1.891-1.742 2.982-4.305 2.982-7.35z" fill="#4285F4" />
						<path d="M10 20c2.7 0 4.964-.895 6.618-2.423l-3.232-2.509c-.895.6-2.04.955-3.386.955-2.605 0-4.81-1.76-5.595-4.123H1.064v2.59A9.996 9.996 0 0 0 10 20z" fill="#34A853" />
						<path d="M4.405 11.9c-.2-.6-.314-1.24-.314-1.9 0-.66.114-1.3.314-1.9V5.51H1.064A9.996 9.996 0 0 0 0 10c0 1.614.386 3.14 1.064 4.49l3.34-2.59z" fill="#FBBC05" />
						<path d="M10 3.977c1.468 0 2.786.505 3.823 1.496l2.868-2.868C14.959.99 12.695 0 10 0 6.09 0 2.71 2.24 1.064 5.51l3.34 2.59C5.192 5.736 7.396 3.977 10 3.977z" fill="#EA4335" />
					{ /* eslint-enable max-len */ }
					</g>
				</svg>

				<span className="social-buttons__service-name">
					{ this.props.translate( 'Continue with %(service)s', {
						args: { service: 'Google' },
						comment: '%(service)s is the name of a Social Network, e.g. "Google", "Facebook", "Twitter" ...'
					} ) }
				</span>
			</button>
		);
	}
}

export default localize( GoogleLoginButton );
