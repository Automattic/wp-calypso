import React, { Component } from 'react';
import wpcom from 'wpcom';
import proxyRequest from 'wpcom-proxy-request';

const getStoredToken = () => {
	try {
		const [ expiry, token ] = localStorage.getItem( 'auth' ).split( ':', 2 );

		return Date.now() < parseInt( expiry, 10 ) ? token : null;
	} catch ( e ) {
		return null;
	}
};

const storeToken = ( token, expiry ) => {
	try {
		localStorage.setItem( 'auth', `${ expiry }:${ token }` );
	} catch ( e ) {}
};

const getTokenFromUrl = () => {
	const tokenPattern = /(?:[#&?]access_token=)([^&]+)/;
	const expiryPattern = /(?:[#&?]expires_in=)(\d+)/;

	const tokenMatch = tokenPattern.exec( document.location );

	if ( ! tokenMatch ) {
		return null;
	}

	const [ , rawToken ] = tokenMatch;
	const token = decodeURIComponent( rawToken );

	const expiryMatch = expiryPattern.exec( document.location );

	if ( ! expiryMatch ) {
		return {
			token,
			expiration: Date.now() + 24 * 60 * 60 * 1000,
		};
	}

	const [ , expiry ] = expiryMatch;

	return {
		token,
		expiration: Date.now() + expiry * 1000,
	};
};

export const AuthWrapper = ( Wrapped ) =>
	class extends Component {
		state = {};

		UNSAFE_componentWillMount() {
			if ( 'production' !== process.env.NODE_ENV ) {
				return this.setState( { oAuthToken: getStoredToken() }, this.maybeRedirectToOAuthLogin );
			}

			const proxiedWpcom = wpcom();
			proxiedWpcom.request = proxyRequest;
			proxiedWpcom.request( { metaAPI: { accessAllUsersBlogs: true } }, ( error ) => {
				if ( error ) {
					throw error;
				}
				this.setState( { wpcom: proxiedWpcom } );
			} );
		}

		componentDidUpdate( prevProps, prevState ) {
			if ( ! prevState.wpcom && this.state.wpcom ) {
				this.setTracksUser();
			}
		}

		maybeRedirectToOAuthLogin = () => {
			if ( this.state.oAuthToken ) {
				return this.setState( { wpcom: wpcom( this.state.oAuthToken ) } );
			}

			const baseUrl = 'https://public-api.wordpress.com/oauth2/authorize';
			const redirectUri = `${ window.location.origin }${ this.props.redirectPath }`;
			const uri = `${ baseUrl }?client_id=${ this.props.clientId }&redirect_uri=${ redirectUri }&response_type=token&scope=global`;

			const auth = getTokenFromUrl();
			if ( auth ) {
				const { token, expiration } = auth;
				storeToken( token, expiration );
				return window.location.replace( redirectUri );
			}

			window.location.replace( uri );
		};

		setTracksUser = () =>
			this.state.wpcom
				.me()
				.get( { fields: 'ID,username' } )
				.then( ( { ID, username } ) => {
					window._tkq = window._tkq || [];
					window._tkq.push( [ 'identifyUser', ID, username ] );
				} )
				.catch( () => {} );

		render() {
			const { clientId, redirectPath, ...childProps } = this.props;

			if ( this.state.wpcom ) {
				return <Wrapped { ...childProps } { ...{ wpcom: this.state.wpcom } } />;
			}

			return null;
		}
	};

export default AuthWrapper;
