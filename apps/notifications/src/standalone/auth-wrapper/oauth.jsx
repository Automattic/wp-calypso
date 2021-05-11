/**
 * External dependencies
 */
import React, { useEffect, useState } from 'react';
import wpcom from 'wpcom';
import wpcomXhrRequest from 'wpcom-xhr-request';

/**
 * Internal dependencies
 */
import setTracksUser from './set-tracks-user';

const getStoredToken = () => {
	try {
		const [ expiry, token ] = window.localStorage.getItem( 'auth' ).split( ':', 2 );

		const isExpired = Date.now() >= parseInt( expiry, 10 );
		return isExpired ? null : token;
	} catch ( e ) {
		return null;
	}
};

const storeToken = ( token, expiry ) => {
	try {
		window.localStorage.setItem( 'auth', `${ expiry }:${ token }` );
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
		const ONE_DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;
		return {
			token,
			expiration: Date.now() + ONE_DAY_IN_MILLISECONDS,
		};
	}

	const [ , expiry ] = expiryMatch;
	return {
		token,
		expiration: Date.now() + expiry * 1000,
	};
};

const redirectForOauth = ( clientId, redirectPath ) => {
	const redirectUri = `${ window.location.origin }${ redirectPath }`;

	const auth = getTokenFromUrl();
	if ( ! auth ) {
		const baseUrl = 'https://public-api.wordpress.com/oauth2/authorize';
		const uri = `${ baseUrl }?client_id=${ clientId }&redirect_uri=${ redirectUri }&response_type=token&scope=global`;

		window.location.replace( uri );
		return;
	}

	const { token, expiration } = auth;
	storeToken( token, expiration );
	window.location.replace( redirectUri );
	return;
};

const getOauthRequestHandler = ( authToken ) => ( options, fn ) => {
	return wpcomXhrRequest( { ...options, authToken }, fn );
};

const useOauthClient = ( clientId, redirectPath ) => {
	const [ client, setClient ] = useState( null );

	useEffect( () => {
		const token = getStoredToken();
		if ( ! token ) {
			redirectForOauth( clientId, redirectPath );
			return;
		}

		const requestHandler = getOauthRequestHandler( token );
		setClient( wpcom( token, requestHandler ) );
	}, [ clientId, redirectPath, setClient ] );

	useEffect( () => {
		if ( ! client ) {
			return;
		}

		setTracksUser( client );
	}, [ client ] );

	return client;
};

const OAuthWrapper = ( Wrapped ) => {
	// This is a wrapped component, not a callback, so hooks are okay.
	/* eslint-disable react-hooks/rules-of-hooks */
	return ( { clientId, redirectPath, ...childProps } ) => {
		const client = useOauthClient( clientId, redirectPath );
		if ( ! client ) {
			return null;
		}

		return <Wrapped wpcom={ client } { ...childProps } />;
	};
	/* eslint-enable react-hooks/rules-of-hooks */
};

export default OAuthWrapper;
