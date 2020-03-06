/**
 * External dependencies
 */
import React, { useEffect, useState } from 'react';
import { noop } from 'lodash';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import debugFactory from 'debug';
import { http } from 'state/data-layer/wpcom-http/actions';
import { getUrlParts } from 'lib/url/url-parts';
import { getHttpData, requestHttpData } from 'state/data-layer/http-data';
import isPrivateSite from 'state/selectors/is-private-site';
import isSiteAutomatedTransfer from 'state/selectors/is-site-automated-transfer';
import getSelectedSiteId from 'state/ui/selectors/get-selected-site-id';
import getSelectedSiteSlug from 'state/ui/selectors/get-selected-site-slug';

const debug = debugFactory( 'calypso:my-sites:media-library:proxied-image' );
const { Blob } = globalThis; // The linter complains if I don't do this...?

const getUrlFromBlob = ( blob: Blob ) =>
	blob instanceof Blob ? URL.createObjectURL( blob ) : undefined;
const fetchProxiedMediaFile = ( siteSlug: string, src: string ) =>
	http( {
		method: 'GET',
		apiNamespace: 'wpcom/v2',
		path: `/sites/${ siteSlug }/atomic-auth-proxy/file${ src }`,
		responseType: 'blob',
	} );

const parseMediaURL = ( url: string, siteSlug: string ) => {
	const { pathname, hostname } = getUrlParts( url );
	if ( hostname !== siteSlug ) {
		if ( hostname.endsWith( 'wp.com' ) || hostname.endsWith( 'wordpress.com' ) ) {
			const [ first, ...rest ] = pathname.substr( 1 ).split( '/' );
			if ( first !== siteSlug ) {
				return {
					isRelativeToSiteRoot: false,
				};
			}
		}
	}

	return {
		relativePath: pathname,
		isRelativeToSiteRoot: true,
	};
};

interface Props {
	src: string;
	siteSlug: string;
	onLoad: () => any;
	useProxy: boolean;
}

const MediaImage: React.FC< Props > = function MediaImage( {
	src,
	relativePath,
	siteSlug,
	useProxy = false,
	...rest
} ) {
	if ( useProxy ) {
		return <ProxiedImage siteSlug={ siteSlug } relativePath={ relativePath } { ...rest } />;
	}

	return <img src={ src } { ...rest } />;
};

export default connect( ( state, { src }: Pick< Props, 'src' > ) => {
	const siteId = getSelectedSiteId( state );
	const siteSlug = getSelectedSiteSlug( state ) as string;
	const isAtomic = !! isSiteAutomatedTransfer( state, siteId as number );
	const isPrivate = !! isPrivateSite( state, siteId );
	const { relativePath, isRelativeToSiteRoot } = parseMediaURL( src, siteSlug );

	const useProxy =
		// Site privacy / coming soon are getting clobbered when the media lib loads
		// Should be fixed when D39264-code lands
		// Hard-coding for now so I can keep working...
		( true || ( isAtomic && isPrivate ) ) && isRelativeToSiteRoot;
	/*
  : hostname === siteSlug && pathname.length > 0 && (true || isAtomic && isPrivate),
   */
	return {
		siteSlug,
		useProxy,
		relativePath,
	};
} )( MediaImage );

const ProxiedImage: React.FC< Props > = function MediaImage( { relativePath, siteSlug, ...rest } ) {
	const [ imageObjectUrl, setImageObjectUrl ] = useState( null );
	const requestId = `media-library-proxied-image-${ siteSlug }${ relativePath }`;

	useEffect( () => {
		if ( imageObjectUrl === null ) {
			const cachedImageBlob = getHttpData( requestId )?.data;
			const url = getUrlFromBlob( cachedImageBlob );
			setImageObjectUrl( url );
			debug( 'set image from cache', { url } );
		}

		requestHttpData( requestId, fetchProxiedMediaFile( siteSlug, relativePath ), {
			freshness: 30000,
			fromApi: () => payload => {
				const imageBlob = payload;
				const url = getUrlFromBlob( imageBlob );
				setImageObjectUrl( url );
				debug( 'got image from API', { payload, url } );
				return [ [ requestId, payload ] ];
			},
		} );

		return () => {
			if ( ! imageObjectUrl ) {
				return;
			}
			debug( 'Cleared blob from memory on dismount: ' + imageObjectUrl );
			URL.revokeObjectURL( imageObjectUrl );
		};
	}, [ imageObjectUrl, relativePath, requestId, siteSlug ] );

	return <img src={ imageObjectUrl } { ...rest } />;
};
