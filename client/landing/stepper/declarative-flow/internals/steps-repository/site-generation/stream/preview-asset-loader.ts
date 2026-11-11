import { parsePreviewAssets } from './html-preview-document';
import type { PreviewAsset, PreviewAssets } from './html-preview-document';

export type LoadedPreviewAsset = { id: string; mimeType: string; bytes: ArrayBuffer };

const MAX_ASSETS = 96;
const MAX_ASSET_BYTES = 8 * 1024 * 1024;
const MAX_TOTAL_BYTES = 32 * 1024 * 1024;
const MAX_CONCURRENT = 3;
const REQUEST_TIMEOUT_MS = 15000;
type Request = {
	asset: PreviewAsset;
	controller: AbortController;
	consumers: Set< AbortSignal >;
	promise: Promise< LoadedPreviewAsset | null >;
	resolve: ( value: LoadedPreviewAsset | null ) => void;
};

async function fetchAsset( request: Request ): Promise< LoadedPreviewAsset | null > {
	let reader: ReadableStreamDefaultReader< Uint8Array > | undefined;
	const cancelReader = () => {
		void reader?.cancel().catch( () => {} );
	};
	try {
		const { asset, controller } = request;
		const response = await fetch( asset.url, {
			credentials: 'omit',
			redirect: 'error',
			mode: 'cors',
			referrerPolicy: 'no-referrer',
			signal: controller.signal,
		} );
		const mime = response.headers.get( 'Content-Type' )?.split( ';' )[ 0 ].trim().toLowerCase();
		const length = response.headers.get( 'Content-Length' );
		if (
			controller.signal.aborted ||
			! response.ok ||
			response.redirected ||
			mime !== asset.mime_type ||
			( length !== null && ( ! /^\d+$/.test( length ) || Number( length ) > MAX_ASSET_BYTES ) ) ||
			! response.body
		) {
			void response.body?.cancel().catch( () => {} );
			return null;
		}
		reader = response.body.getReader();
		controller.signal.addEventListener( 'abort', cancelReader, { once: true } );
		const chunks: Uint8Array[] = [];
		let size = 0;
		while ( ! controller.signal.aborted ) {
			const { done, value } = await reader.read();
			if ( controller.signal.aborted ) {
				return null;
			}
			if ( done ) {
				if ( ! size ) {
					return null;
				}
				const bytes = new Uint8Array( size );
				let offset = 0;
				for ( const chunk of chunks ) {
					bytes.set( chunk, offset );
					offset += chunk.byteLength;
				}
				return { id: asset.id, mimeType: mime, bytes: bytes.buffer };
			}
			size += value.byteLength;
			if ( size > MAX_ASSET_BYTES ) {
				return null;
			}
			chunks.push( value );
		}
	} catch {
		// Asset failure must not prevent the surrounding document from rendering.
	} finally {
		request.controller.signal.removeEventListener( 'abort', cancelReader );
		if ( reader ) {
			void reader.cancel().catch( () => {} );
			reader.releaseLock();
		}
	}
	return null;
}

export function createPreviewAssetLoader( snapshotUrl: string ) {
	const cache = new Map< string, LoadedPreviewAsset >();
	const requests = new Map< string, Request >();
	const queue: Request[] = [];
	const loads = new Set< AbortController >();
	let cacheBytes = 0;
	let active = 0;
	let disposed = false;

	function remember( asset: LoadedPreviewAsset ) {
		if ( cache.has( asset.id ) ) {
			return;
		}
		while ( cache.size >= MAX_ASSETS || cacheBytes + asset.bytes.byteLength > MAX_TOTAL_BYTES ) {
			const oldest = cache.values().next().value;
			if ( ! oldest ) {
				break;
			}
			cache.delete( oldest.id );
			cacheBytes -= oldest.bytes.byteLength;
		}
		cache.set( asset.id, asset );
		cacheBytes += asset.bytes.byteLength;
	}

	function startRequests() {
		while ( ! disposed && active < MAX_CONCURRENT && queue.length ) {
			const request = queue.shift();
			if ( ! request || request.controller.signal.aborted ) {
				continue;
			}
			active++;
			let onAbort!: () => void;
			const canceled = new Promise< null >( ( resolve ) => {
				onAbort = () => resolve( null );
				request.controller.signal.addEventListener( 'abort', onAbort, { once: true } );
			} );
			const timeout = setTimeout( () => request.controller.abort(), REQUEST_TIMEOUT_MS );
			void Promise.race( [ fetchAsset( request ), canceled ] )
				.then( ( asset ) => {
					if (
						! disposed &&
						! request.controller.signal.aborted &&
						request.consumers.size &&
						asset
					) {
						request.resolve( asset );
					} else {
						request.resolve( null );
					}
				} )
				.finally( () => {
					clearTimeout( timeout );
					request.controller.signal.removeEventListener( 'abort', onAbort );
					if ( requests.get( request.asset.id ) === request ) {
						requests.delete( request.asset.id );
					}
					active--;
					startRequests();
				} );
		}
	}

	function acquire( asset: PreviewAsset, signal: AbortSignal ): Request | null {
		let request = requests.get( asset.id );
		if ( request && request.asset.mime_type !== asset.mime_type ) {
			return null;
		}
		if ( ! request ) {
			if ( requests.size >= MAX_ASSETS ) {
				return null;
			}
			let resolve!: Request[ 'resolve' ];
			const promise = new Promise< LoadedPreviewAsset | null >( ( accept ) => {
				resolve = accept;
			} );
			request = {
				asset: { ...asset },
				controller: new AbortController(),
				consumers: new Set(),
				promise,
				resolve,
			};
			requests.set( asset.id, request );
			queue.push( request );
		}
		request.consumers.add( signal );
		return request;
	}

	return {
		async load(
			assets: PreviewAssets,
			signal: AbortSignal
		): Promise< Record< string, LoadedPreviewAsset > > {
			if ( disposed || signal.aborted ) {
				return {};
			}
			const lifetime = new AbortController();
			loads.add( lifetime );
			const attached = new Set< Request >();
			const result: Record< string, LoadedPreviewAsset > = {};
			const fetched = new Map< string, LoadedPreviewAsset >();
			let resultBytes = 0;
			let resolveAborted!: () => void;
			const aborted = new Promise< void >( ( resolve ) => {
				resolveAborted = resolve;
			} );
			const releaseRequest = ( request: Request ) => {
				attached.delete( request );
				request.consumers.delete( lifetime.signal );
				if ( ! request.consumers.size ) {
					request.controller.abort();
					request.resolve( null );
					if ( requests.get( request.asset.id ) === request ) {
						requests.delete( request.asset.id );
					}
					const index = queue.indexOf( request );
					if ( index !== -1 ) {
						queue.splice( index, 1 );
					}
				}
			};
			const release = () => {
				for ( const request of attached ) {
					releaseRequest( request );
				}
				resolveAborted();
			};
			const abort = () => lifetime.abort();
			lifetime.signal.addEventListener( 'abort', release, { once: true } );
			signal.addEventListener( 'abort', abort, { once: true } );
			try {
				const work = Object.entries( assets )
					.slice( 0, MAX_ASSETS )
					.map( async ( [ source, asset ] ) => {
						if ( ! parsePreviewAssets( { [ source ]: asset }, snapshotUrl )[ source ] ) {
							return;
						}
						let loaded = cache.get( asset.id );
						if ( loaded && loaded.mimeType !== asset.mime_type ) {
							return;
						}
						if ( loaded ) {
							cache.delete( asset.id );
							cache.set( asset.id, loaded );
						} else {
							const request = acquire( asset, lifetime.signal );
							if ( ! request ) {
								return;
							}
							attached.add( request );
							loaded = ( await request.promise ) ?? undefined;
							releaseRequest( request );
						}
						if (
							! loaded ||
							lifetime.signal.aborted ||
							disposed ||
							resultBytes + loaded.bytes.byteLength > MAX_TOTAL_BYTES
						) {
							return;
						}
						result[ source ] = { ...loaded, bytes: loaded.bytes.slice( 0 ) };
						fetched.set( loaded.id, loaded );
						resultBytes += loaded.bytes.byteLength;
					} );
				startRequests();
				await Promise.race( [ Promise.all( work ), aborted ] );
				if ( lifetime.signal.aborted || disposed ) {
					return {};
				}
				for ( const loaded of fetched.values() ) {
					remember( loaded );
				}
				return result;
			} finally {
				signal.removeEventListener( 'abort', abort );
				lifetime.signal.removeEventListener( 'abort', release );
				release();
				loads.delete( lifetime );
			}
		},
		dispose() {
			disposed = true;
			for ( const lifetime of loads ) {
				lifetime.abort();
			}
			cache.clear();
			cacheBytes = 0;
		},
	};
}
