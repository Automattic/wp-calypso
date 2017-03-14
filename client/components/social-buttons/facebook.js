/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import SocialLogo from 'social-logos';
import { loadScript } from 'lib/load-script';

export default class FacebookLoginButton extends Component {

	// See: https://developers.facebook.com/docs/javascript/reference/FB.init/v2.8
	static propTypes = {
		appId: PropTypes.string.isRequired,
		version: PropTypes.string,
		cookie: PropTypes.bool,
		status: PropTypes.bool,
		xfbml: PropTypes.bool,
		responseHandler: PropTypes.func.isRequired,
		scope: PropTypes.string,
	};

	static defaultProps = {
		version: 'v2.8',
		cookie: false,
		status: false,
		xfbml: true,
		scope: 'public_profile,email',
	};

	constructor( props ) {
		super( props );
		this.FB = null;
		this.handleClick = this.handleClick.bind( this );
	}

	componentWillMount() {
		this.loadFacebookAuth();
	}

	loadDependency() {
		if ( window.FB ) {
			return Promise.resolve( window.FB );
		}

		return new Promise( resolve => {
			loadScript( '//connect.facebook.net/en_US/sdk.js', () => resolve( window.FB ) );
		} );
	}

	loadFacebookAuth() {
		if ( this.FB ) {
			return Promise.resolve();
		}

		return new Promise( resolve => {
			this.loadDependency().then( FB => {
				FB.init( {
					appId: this.props.appId,
					version: this.props.version,
					cookie: this.props.cookie,
					xfbml: this.props.xfbml,
				} );
				this.FB = FB;
				resolve();
			} );
		} );
	}

	handleClick() {
		const { responseHandler, scope } = this.props;

		// Handle click async if the library is not loaded yet
		// the popup might be blocked by the browser in that case
		this.loadFacebookAuth().then( () => {
			this.FB.login( response => {
				responseHandler( response );
			}, { scope } );
		} );
	}

	render() {
		return (
			<button className="button" onClick={ this.handleClick }>
				<span>
					<SocialLogo className="social-buttons__logo" icon="facebook" size={ 24 } />
					<span className="social-buttons__service-name">
						Facebook
					</span>
				</span>
			</button>
		);
	}
}
