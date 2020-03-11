/**
 * External dependencies
 */
import React, { useEffect, useState, useRef } from 'react';

/**
 * Internal dependencies
 */
import debugFactory from 'debug';
import wpcom from 'lib/wp';

const debug = debugFactory( 'calypso:my-sites:media-library:proxied-image' );
const { Blob } = globalThis; // The linter complains if I don't do this...?

type RenderedComponentProps = {
	src: string;
	[ key: string ]: any;
};
export type RenderedComponent = string | React.ComponentType< RenderedComponentProps >;

interface Props {
	query: string;
	filePath: string;
	siteSlug: string;
	placeholder: React.ReactNode | null;
	component: RenderedComponent;

	[ key: string ]: any;
}

const cache: { [ key: string ]: Blob } = {};
const cacheResponse = ( requestId: string, blob: Blob, freshness = 60000 ) => {
	// Cache at most 100 items
	const cacheKeys = Object.keys( cache );
	if ( cacheKeys.length > 100 ) {
		delete cache[ cacheKeys[ 0 ] ];
	}

	cache[ requestId ] = blob;

	// Self-remove this entry after `freshness` ms
	setTimeout( () => {
		delete cache[ requestId ];
	}, freshness );
};

const ProxiedImage: React.FC< Props > = function ProxiedImage( {
	siteSlug,
	filePath,
	query,
	placeholder,
	component: Component,
	...rest
} ) {
	const [ imageObjectUrl, setImageObjectUrl ] = useState< string >( '' );
	const requestId = `media-library-proxied-image-${ siteSlug }${ filePath }${ query }`;
	const refContainer = useRef(null);

	useEffect( () => {
		if ( ! imageObjectUrl ) {
			if ( cache[ requestId ] ) {
				const url = URL.createObjectURL( cache[ requestId ] );
				setImageObjectUrl( url );
				debug( 'set image from cache', { url } );
			} else {
				debug( 'requesting image from API', { requestId, imageObjectUrl } );
				let streamingFinished = false;
				const xhr = wpcom
					.undocumented()
					.getAtomicSiteMediaViaProxy(
						siteSlug,
						filePath,
						query,
						( err: Error, data: Blob | null ) => {
							streamingFinished = true;
							if ( ! filePath.includes("mp4") && data instanceof Blob ) {
								cacheResponse( requestId, data );
								setImageObjectUrl( URL.createObjectURL( data ) );
								debug( 'got image from API', { requestId, imageObjectUrl, data } );
							}
						}
					);

				if(filePath.includes("mp4"))
				{
					const chunks = [];
					xhr.addEventListener( "progress", function(e) {
						chunks.push(e.chunk);
					}, false );

					const getNextChunk = function() {
						if(chunks.length) {
							return chunks.shift();
						}
						// return new Promise(function(resolve) {
						// 	const onProgress = function ( e ) {
						// 		xhr.removeEventListener( "progress", onProgress );
						// 		resolve( chunks.shift() );
						// 	};
						// 	xhr.addEventListener( "progress", onProgress, false );
						// });
					};

					function onSourceOpen(mediaSource, e) {
						console.log(e);

						const videoTag = refContainer.current;
						if (mediaSource.sourceBuffers.length > 0) {
							console.log('no source buffers');
							return;
						}

						console.log('adding source buffer ', mediaSource.readyState);
						let mimeCodec = 'video/mp4; codecs="avc1.42E01E, mp4a.40.2"';
						let sourceBuffer = mediaSource.addSourceBuffer(mimeCodec);

						videoTag.addEventListener('progress', onProgress.bind(videoTag, mediaSource));

						const initSegment = getNextChunk();
						if (initSegment == null) {
							// Error fetching the initialization segment. Signal end of stream with an error.
							mediaSource.endOfStream("network");
							console.log('init segment bye bye, end of stream!');
							return;
						}

						// Append the initialization segment.
						var firstAppendHandler = function(e) {
							const sourceBuffer = e.target;
							sourceBuffer.removeEventListener('updateend', firstAppendHandler);

							// Append some initial media data.
							appendNextMediaSegment(mediaSource);
						};
						sourceBuffer.addEventListener('updateend', firstAppendHandler);
						sourceBuffer.appendBuffer(initSegment);
					}

					function appendNextMediaSegment(mediaSource) {
						if (mediaSource.readyState === "closed") {
							console.log('media source ready state is closed!');
							return;
						}

						// if (streamingFinished) {
							// Error fetching the next media segment.
							// mediaSource.endOfStream("network");
							// return;
						// }

						const segment = getNextChunk();

						// If we have run out of stream data, then signal end of stream.
						if (!segment && streamingFinished) {
							console.log('streaming finished!');
							//mediaSource.endOfStream();
							return;
						}

						// Make sure the previous append is not still pending.
						if (mediaSource.sourceBuffers[0].updating) {
							console.log('updating');
							return;
						}

						// NOTE: If mediaSource.readyState == “ended”, this appendBuffer() call will
						// cause mediaSource.readyState to transition to "open". The web application
						// should be prepared to handle multiple “sourceopen” events.
						console.log('append next media segment', segment);
						mediaSource.sourceBuffers[0].appendBuffer(segment);
						appendNextMediaSegment(mediaSource);
					}

					function onProgress( mediaSource, e ) {
						appendNextMediaSegment( mediaSource );
					}

					setTimeout(function() {
						let mediaSource = new MediaSource();
						mediaSource.addEventListener('sourceopen', e => onSourceOpen(mediaSource, e));
						setImageObjectUrl( URL.createObjectURL( mediaSource ) );
					}, 5000);
				}
			}
		}

		return () => {
			if ( imageObjectUrl ) {
				debug( 'Cleared blob from memory on dismount: ' + imageObjectUrl );
				URL.revokeObjectURL( imageObjectUrl );
			}
		};
	}, [ imageObjectUrl, filePath, requestId, siteSlug ] );

	if ( ! imageObjectUrl ) {
		return placeholder as React.ReactElement;
	}

	/* eslint-disable-next-line jsx-a11y/alt-text */
	return <Component src={ imageObjectUrl } { ...rest } ref={refContainer} autoplay />;
};

ProxiedImage.defaultProps = {
	placeholder: null,
};

export default ProxiedImage;
