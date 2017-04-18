/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import SocialLogo from 'social-logos';
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
				<span>
					<SocialLogo className="social-buttons__logo" icon="google" size={ 24 } />

					<span className="social-buttons__service-name">
						{ this.props.translate( 'Continue with %(service)s', {
							args: { service: 'Google' },
							comment: '%(service)s is the name of a Social Network, e.g. "Google", "Facebook", "Twitter" ...'
						} ) }
					</span>
				</span>
			</button>
		);
	}
}

export default localize( GoogleLoginButton );
