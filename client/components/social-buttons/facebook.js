/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { loadScript } from 'lib/load-script';
import { localize } from 'i18n-calypso';

class FacebookLoginButton extends Component {
	// See: https://developers.facebook.com/docs/javascript/reference/FB.init/v2.8
	static propTypes = {
		appId: PropTypes.string.isRequired,
		version: PropTypes.string,
		cookie: PropTypes.bool,
		status: PropTypes.bool,
		xfbml: PropTypes.bool,
		responseHandler: PropTypes.func.isRequired,
		scope: PropTypes.string,
		translate: PropTypes.func.isRequired
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

		this.initialized = null;
		this.handleClick = this.handleClick.bind( this );
	}

	componentWillMount() {
		this.initialize();
	}

	loadDependency() {
		if ( window.FB ) {
			return Promise.resolve( window.FB );
		}

		return new Promise( resolve => {
			loadScript( '//connect.facebook.net/en_US/sdk.js', () => resolve( window.FB ) );
		} );
	}

	initialize() {
		if ( this.initialized ) {
			return this.initialized;
		}

		this.initialized = this.loadDependency().then( FB => {
			FB.init( {
				appId: this.props.appId,
				version: this.props.version,
				cookie: this.props.cookie,
				xfbml: this.props.xfbml,
			} );

			return FB;
		} ).catch( error => {
			this.initialized = null;

			return Promise.reject( error );
		} );

		return this.initialized;
	}

	handleClick( event ) {
		event.preventDefault();

		const { responseHandler, scope } = this.props;

		// Handle click async if the library is not loaded yet
		// the popup might be blocked by the browser in that case
		this.initialize().then( FB => {
			FB.login( response => {
				responseHandler( response );
			}, { scope } );
		} );
	}

	render() {
		return (
			<button className="button" onClick={ this.handleClick }>
				<svg className="social-buttons__logo" width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
					{ /* eslint-disable max-len */ }
					<path d="M18.86.041H1.14a1.1 1.1 0 0 0-1.099 1.1v17.718a1.1 1.1 0 0 0 1.1 1.1h9.539v-7.713H8.084V9.24h2.596V7.023c0-2.573 1.571-3.973 3.866-3.973 1.1 0 2.044.081 2.32.118v2.688l-1.592.001c-1.248 0-1.49.593-1.49 1.463v1.92h2.977l-.388 3.006h-2.59v7.713h5.076a1.1 1.1 0 0 0 1.1-1.1V1.14a1.1 1.1 0 0 0-1.1-1.099" fill="#3E68B5" fillRule="evenodd" />
					{ /* eslint-enable max-len */ }
				</svg>

				<span className="social-buttons__service-name">
					{ this.props.translate( 'Continue with %(service)s', {
						args: { service: 'Facebook' },
						comment: '%(service)s is the name of a Social Network, e.g. "Google", "Facebook", "Twitter" ...'
					} ) }
				</span>
			</button>
		);
	}
}

export default localize( FacebookLoginButton );
