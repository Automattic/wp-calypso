/**
 * External dependencies
 */
import React, { useEffect, useState } from 'react';
import wpcom from 'wpcom';
import proxyRequest from 'wpcom-proxy-request';

/**
 * Internal dependencies
 */
import setTracksUser from './set-tracks-user';

const useIframeProxyClient = () => {
	const [ client, setClient ] = useState( null );

	useEffect( () => {
		const tempClient = wpcom( proxyRequest );
		tempClient.request( { metaAPI: { accessAllUsersBlogs: true } }, ( error ) => {
			if ( error ) {
				throw error;
			}

			setClient( tempClient );
		} );
	}, [] );

	return client;
};

const IframeProxyWrapper = ( Wrapped ) => {
	// This is a wrapped component, not a callback, so hooks are okay.
	/* eslint-disable react-hooks/rules-of-hooks */
	return ( { ...childProps } ) => {
		const client = useIframeProxyClient();

		useEffect( () => {
			if ( ! client ) {
				return;
			}

			setTracksUser( client );
		}, [ client ] );

		if ( ! client ) {
			return null;
		}

		return <Wrapped wpcom={ client } { ...childProps } />;
	};
	/* eslint-enable react-hooks/rules-of-hooks */
};

export default IframeProxyWrapper;
