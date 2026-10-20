import config from '@automattic/calypso-config';
import { lazy, useMemo, Suspense, type ComponentType, type ReactNode } from 'react';
import { bumpStat } from 'calypso/lib/analytics/mc';
import { logToLogstash } from 'calypso/lib/logstash';

import './style.scss';

const DEFAULT_PLACEHOLDER = <div className="async-load__placeholder" />;

type RequireCallback = () => Promise< { default: ComponentType< any > } >;

function isChunkLoadError( error: unknown ): boolean {
	return (
		error instanceof Error &&
		( error.name === 'ChunkLoadError' ||
			( error as { code?: string } ).code === 'CSS_CHUNK_LOAD_FAILED' )
	);
}

function getChunkName( error: Error ): string {
	/* Webpack sets `request` to the URL of the chunk that failed to load. */
	const request = ( error as { request?: unknown } ).request;
	if ( typeof request !== 'string' ) {
		return 'async-load';
	}

	return request.split( '?' )[ 0 ].split( '/' ).pop()?.split( '.' )[ 0 ] || 'async-load';
}

const loggedChunkErrors = new Set< string >();

/* Content blockers that block chunks usually block pixel.wp.com too, so also log through the REST API, at most once per chunk per page session. */
function reportChunkLoadError( chunkName: string ) {
	bumpStat( 'calypso_chunk_error', chunkName );

	if ( loggedChunkErrors.has( chunkName ) ) {
		return;
	}
	loggedChunkErrors.add( chunkName );

	logToLogstash( {
		feature: 'calypso_client',
		message: 'AsyncLoad chunk failed to load',
		severity: config( 'env_id' ) === 'production' ? 'error' : 'debug',
		properties: {
			type: 'calypso_chunk_error',
			chunk: chunkName,
			env: config( 'env_id' ),
		},
	} ).catch( () => {} );
}

type AsyncLoadProps = {
	placeholder?: ReactNode;
	loadFailureFallback?: ReactNode;
	require: RequireCallback;
	[ key: string ]: unknown;
};

export default function AsyncLoad( {
	placeholder = DEFAULT_PLACEHOLDER,
	loadFailureFallback,
	require,
	...props
}: AsyncLoadProps ) {
	/* Guard chunk-load failures only: module evaluation errors and runtime errors inside the loaded component still propagate. */
	const Component = useMemo(
		() =>
			lazy( () => {
				if ( typeof loadFailureFallback === 'undefined' ) {
					return require();
				}

				return Promise.resolve()
					.then( require )
					.catch( ( error ) => {
						if ( ! isChunkLoadError( error ) ) {
							throw error;
						}

						reportChunkLoadError( getChunkName( error ) );

						return { default: () => <>{ loadFailureFallback }</> };
					} );
			} ),
		/* Only `require` should recreate the lazy factory; adding the fallback would remount and re-import when callers pass an inline value. */
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[ require ]
	);

	return (
		<Suspense fallback={ placeholder }>
			<Component { ...props } />
		</Suspense>
	);
}
