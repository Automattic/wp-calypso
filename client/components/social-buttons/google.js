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
		this.initGoogleP = null;
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
			loadScript( 'https://apis.google.com/js/api.js', () => resolve( window.gapi ) );
		} );
	}

	loadGoogleAuth() {
		if ( this.initGoogleP ) {
			return this.initGoogleP;
		}

		this.initGoogleP = this.loadDependency()
			.then( gapi => new Promise( resolve => gapi.load( 'client:auth2', resolve ) ).then( () => gapi ) )
			.then( gapi => gapi.client.init( {
					client_id: this.props.clientId,
					scope: this.props.scope,
					fetch_basic_profile: this.props.fetchBasicProfile,
				} )
				.then( () => gapi ) // don't try to return gapi.auth2.getAuthInstance() here, it has a `then` method
			).catch( error => {
				this.initGoogleP = null;
				return Promise.reject( error );
			} );

		return this.initGoogleP;
	}

	handleClick() {
		const { responseHandler } = this.props;

		// Handle click async if the library is not loaded yet
		// the popup might be blocked by the browser in that case
		this.loadGoogleAuth().then( gapi => gapi.auth2.getAuthInstance().signIn().then( responseHandler ) );
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
