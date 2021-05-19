/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import createIframeProxyClient from './client/iframe-proxy';
import createOauthClient from './client/oauth';
import { useClient } from './client';

const isProduction = 'production' === process.env.NODE_ENV;
const clientFactory = isProduction ? createIframeProxyClient : createOauthClient;

const AuthWrapper = ( Wrapped ) => {
	return function WithWpcomClient( props ) {
		// IMPORTANT NOTE: when `clientFactory` is called, it could invoke
		// a browser redirect; ex. createOauthClient -> redirectForOauth
		const wpcom = useClient( clientFactory );

		if ( ! wpcom ) {
			return null;
		}

		return <Wrapped wpcom={ wpcom } { ...props } />;
	};
};

export default AuthWrapper;
