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
		const tempClient = wpcom();
		tempClient.request = proxyRequest;
		tempClient.request( { metaAPI: { accessAllUsersBlogs: true } }, ( error ) => {
			if ( error ) {
				throw error;
			}

			setClient( tempClient );
		} );
	}, [] );

	return client;
};

const IframeProxyWrapper = ( Wrapped ) => ( { ...childProps } ) => {
	// This is a wrapped component, not a callback, so hooks are okay.
	// eslint-disable-next-line react-hooks/rules-of-hooks
	const client = useIframeProxyClient();
	if ( ! client ) {
		return null;
	}

	setTracksUser( client );

	return <Wrapped wpcom={ client } { ...childProps } />;
};

export default IframeProxyWrapper;
