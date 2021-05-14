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
		tempClient.request( { metaAPI: { accessAllUsersBlogs: true } }, () => {
			setClient( tempClient );
		} );
	}, [] );

	return client;
};

const IframeProxyWrapper = ( Wrapped ) => {
	return function WithIFrameProxyClient( childProps ) {
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
};

export default IframeProxyWrapper;
