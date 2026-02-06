/**
 * Standalone version of resolveRemoteBlueprint() from @wp-playground/blueprints
 *
 * This file contains everything needed to resolve a remote blueprint without
 * depending on the full @wp-playground/blueprints or @wp-playground/storage packages.
 *
 * External dependency required: @zip.js/zip.js
 *   npm install @zip.js/zip.js
 */

import { ZipReader, BlobWriter, BlobReader } from '@zip.js/zip.js';
import type { Entry } from '@zip.js/zip.js';

// ============================================================================
// Types
// ============================================================================

/**
 * A simple file tree structure where keys are file paths and values are
 * file contents (as strings or Uint8Array) or nested file trees.
 */
export interface FileTree extends Record< string, Uint8Array | string | FileTree > {}

/**
 * Interface for a readable filesystem backend.
 */
export interface ReadableFilesystemBackend {
	read( path: string ): Promise< StreamedFile >;
}

/**
 * A filesystem structure containing a /blueprint.json file and any
 * resources referenced by that blueprint.
 */
export type BlueprintBundle = ReadableFilesystemBackend;

// ============================================================================
// Utilities
// ============================================================================

/**
 * Concatenates multiple Uint8Arrays into a single Uint8Array.
 */
function concatUint8Array( ...arrays: Uint8Array[] ): Uint8Array {
	const result = new Uint8Array( arrays.reduce( ( sum, array ) => sum + array.length, 0 ) );
	let offset = 0;
	for ( const array of arrays ) {
		result.set( array, offset );
		offset += array.length;
	}
	return result;
}

/**
 * Concatenates the contents of the stream into a single Uint8Array.
 */
function concatBytes( totalBytes?: number ): TransformStream< Uint8Array, Uint8Array > {
	if ( totalBytes === undefined ) {
		let acc: Uint8Array = new Uint8Array();
		return new TransformStream< Uint8Array, Uint8Array >( {
			transform( chunk ) {
				acc = concatUint8Array( acc, chunk ) as Uint8Array;
			},
			flush( controller ) {
				controller.enqueue( acc );
			},
		} );
	}

	const buffer = new ArrayBuffer( totalBytes || 0 );
	let offset = 0;
	return new TransformStream< Uint8Array, Uint8Array >( {
		transform( chunk ) {
			const view = new Uint8Array( buffer );
			view.set( chunk, offset );
			offset += chunk.byteLength;
		},
		flush( controller ) {
			controller.enqueue( new Uint8Array( buffer ) );
		},
	} );
}

/**
 * Limit the number of bytes read from a stream.
 */
function limitBytes(
	stream: ReadableStream< Uint8Array >,
	bytes: number
): ReadableStream< Uint8Array > {
	if ( bytes === 0 ) {
		return new ReadableStream( {
			start( controller ) {
				controller.close();
			},
		} );
	}
	const reader = stream.getReader( { mode: 'byob' } );
	let offset = 0;
	return new ReadableStream( {
		async pull( controller ) {
			const { value, done } = await reader.read( new Uint8Array( bytes - offset ) );
			if ( done ) {
				reader.releaseLock();
				controller.close();
				return;
			}
			offset += value.length;
			controller.enqueue( value );

			if ( offset >= bytes ) {
				reader.releaseLock();
				controller.close();
			}
		},
		cancel() {
			reader.cancel();
		},
	} );
}

/**
 * Collects the contents of the entire stream into a single Uint8Array.
 */
async function collectBytes(
	stream: ReadableStream< Uint8Array >,
	bytes?: number
): Promise< Uint8Array > {
	if ( bytes !== undefined ) {
		stream = limitBytes( stream, bytes );
	}

	return await stream
		.pipeThrough( concatBytes( bytes ) )
		.getReader()
		.read()
		.then( ( { value } ) => value! );
}

/**
 * Normalizes path segments, resolving . and .. references.
 */
function normalizePathsArray( parts: string[], allowAboveRoot: boolean ): string[] {
	let up = 0;
	for ( let i = parts.length - 1; i >= 0; i-- ) {
		const last = parts[ i ];
		if ( last === '.' ) {
			parts.splice( i, 1 );
		} else if ( last === '..' ) {
			parts.splice( i, 1 );
			up++;
		} else if ( up ) {
			parts.splice( i, 1 );
			up--;
		}
	}

	if ( allowAboveRoot ) {
		for ( ; up--; up ) {
			parts.unshift( '..' );
		}
	}

	return parts;
}

/**
 * Normalizes a file path, resolving . and .. references.
 */
function normalizePath( path: string ): string {
	const isAbsolute = path[ 0 ] === '/';
	path = normalizePathsArray(
		path.split( '/' ).filter( ( p: string ) => !! p ),
		! isAbsolute
	).join( '/' );
	return ( isAbsolute ? '/' : '' ) + path.replace( /\/$/, '' );
}

// ============================================================================
// StreamedFile
// ============================================================================

/**
 * Represents a file that is streamed and not fully loaded into memory.
 */
export class StreamedFile extends File {
	readonly filesize: number | undefined;
	private readableStream: ReadableStream< Uint8Array >;

	static fromArrayBuffer(
		arrayBuffer: Uint8Array,
		name: string,
		options?: { type?: string; filesize?: number }
	): StreamedFile {
		return new StreamedFile(
			new ReadableStream( {
				start( controller ) {
					controller.enqueue( new Uint8Array( arrayBuffer ) );
					controller.close();
				},
			} ),
			name,
			options
		);
	}

	constructor(
		readableStream: ReadableStream< Uint8Array >,
		name: string,
		options?: { type?: string; filesize?: number }
	) {
		super( [], name, { type: options?.type } );
		this.readableStream = readableStream;
		this.filesize = options?.filesize;
	}

	override slice(): Blob {
		throw new Error( 'slice() is not possible on a StreamedFile' );
	}

	override stream(): ReadableStream< Uint8Array > {
		return this.readableStream;
	}

	override async text(): Promise< string > {
		return new TextDecoder().decode( await this.arrayBuffer() );
	}

	override async arrayBuffer(): Promise< ArrayBuffer > {
		return ( await collectBytes( this.stream() ) ) as unknown as ArrayBuffer;
	}
}

// ============================================================================
// Filesystem Implementations
// ============================================================================

/**
 * An in-memory filesystem that stores files in a tree structure.
 */
export class InMemoryFilesystem implements ReadableFilesystemBackend {
	private fileTree: FileTree;

	constructor( fileTree: FileTree ) {
		this.fileTree = fileTree;
	}

	async read( path: string ): Promise< StreamedFile > {
		let content = this.getEntryAtPath( path );
		if ( typeof content === 'string' ) {
			content = new TextEncoder().encode( content );
		} else if ( ! ( content instanceof Uint8Array ) ) {
			throw new Error( `Unsupported content type: ${ typeof content }` );
		}
		const stream = new ReadableStream( {
			start( controller ) {
				controller.enqueue( content );
				controller.close();
			},
		} );
		return new StreamedFile( stream, path, {
			filesize: content.byteLength,
		} );
	}

	private getEntryAtPath( path: string ): Uint8Array | string | FileTree {
		let remainingPath = path.replace( /^\//, '' );
		let currentSubtree = this.fileTree;
		while ( remainingPath ) {
			if ( currentSubtree[ remainingPath ] ) {
				return currentSubtree[ remainingPath ];
			}
			const segments = remainingPath.split( '/' );
			const nextSegment = segments.shift();
			if ( ! nextSegment || ! currentSubtree[ nextSegment ] ) {
				break;
			}
			currentSubtree = currentSubtree[ nextSegment ] as FileTree;
			remainingPath = segments.join( '/' );
		}
		throw new Error( `File not found at ${ path }` );
	}
}

/**
 * A filesystem that reads files from a ZIP archive.
 */
export class ZipFilesystem implements ReadableFilesystemBackend {
	private entries: Map< string, Entry > = new Map();
	private zipReader: ZipReader< BlobReader >;

	static fromStream( stream: ReadableStream< Uint8Array > ): ZipFilesystem {
		const zipReader = new ZipReader( new BlobReader( new StreamedFile( stream, 'archive.zip' ) ) );
		return new ZipFilesystem( zipReader );
	}

	static fromArrayBuffer( arrayBuffer: ArrayBuffer ): ZipFilesystem {
		const zipReader = new ZipReader( new BlobReader( new Blob( [ arrayBuffer ] ) ) );
		return new ZipFilesystem( zipReader );
	}

	constructor( zipReader: ZipReader< BlobReader > ) {
		this.zipReader = zipReader;
	}

	async read( relativePath: string ): Promise< StreamedFile > {
		const entry = await this.getEntry( relativePath );
		if ( ! ( 'getData' in entry ) || ! entry.getData ) {
			throw new Error( `Entry at ${ relativePath } is a directory, not a file.` );
		}
		const blob = await entry.getData( new BlobWriter() );
		return new StreamedFile( blob.stream(), relativePath, {
			filesize: entry.uncompressedSize,
		} );
	}

	private async getEntry( relativePath: string ): Promise< Entry > {
		const entries = await this.getEntries();
		const entry = entries.get( relativePath.replace( /^\//, '' ) );
		if ( ! entry ) {
			throw new Error( `File ${ relativePath } not found in the zip.` );
		}
		return entry;
	}

	private async getEntries(): Promise< Map< string, Entry > > {
		if ( this.entries.size === 0 ) {
			const entries = await this.zipReader.getEntries();
			for ( const entry of entries ) {
				this.entries.set( entry.filename, entry );
			}
		}
		return this.entries;
	}
}

/**
 * A filesystem that cascades through multiple filesystems and returns
 * the first successful result.
 */
export class OverlayFilesystem implements ReadableFilesystemBackend {
	private filesystems: ReadableFilesystemBackend[];

	constructor( filesystems: ReadableFilesystemBackend[] ) {
		if ( ! filesystems.length ) {
			throw new Error( 'OverlayFilesystem requires at least one filesystem' );
		}
		this.filesystems = filesystems;
	}

	async read( path: string ): Promise< StreamedFile > {
		const errors: Error[] = [];

		for ( const filesystem of this.filesystems ) {
			try {
				return await filesystem.read( path );
			} catch ( error ) {
				errors.push( error instanceof Error ? error : new Error( String( error ) ) );
			}
		}

		const errorMessages = errors.map( ( e ) => e.message ).join( '; ' );
		throw new Error( `Failed to read ${ path } from any filesystem: ${ errorMessages }`, {
			cause: errors,
		} );
	}
}

export interface FetchFilesystemOptions {
	corsProxy?: string;
	baseUrl: string;
}

/**
 * A filesystem that fetches files from URLs.
 */
export class FetchFilesystem implements ReadableFilesystemBackend {
	private baseUrl = '';
	private options: FetchFilesystemOptions;
	private isDataUrl: boolean;

	constructor( options: FetchFilesystemOptions ) {
		this.options = options;
		this.isDataUrl = options.baseUrl.startsWith( 'data:' );
		if ( this.isDataUrl ) {
			return;
		}
		const url = new URL( './', options.baseUrl );
		if ( url.protocol !== 'http:' && url.protocol !== 'https:' ) {
			throw new Error(
				'Unsupported protocol: ' + url.protocol + '. Only HTTP and HTTPS are supported.'
			);
		}
		this.baseUrl = url.origin + url.pathname;
	}

	async read( path: string ): Promise< StreamedFile > {
		if ( this.isDataUrl ) {
			throw new Error( 'FetchFilesystem cannot fetch files from data URLs' );
		}

		path = normalizePath( path );
		const cleanPath = path.replace( /^\//, '' );

		const url = new URL( cleanPath, this.baseUrl ).toString();
		if ( ! url.startsWith( this.baseUrl ) ) {
			throw new Error( `Refused to read a file outside of the base URL: ${ url }` );
		}

		const finalUrl = this.options.corsProxy
			? `${ this.options.corsProxy }${ encodeURIComponent( url ) }`
			: url;

		const response = await fetch( finalUrl );
		if ( ! response.ok ) {
			throw new Error( `Failed to fetch file at ${ path }: ${ response.statusText }` );
		}

		const filesize = response.headers.get( 'content-length' )
			? parseInt( response.headers.get( 'content-length' )!, 10 )
			: undefined;

		return new StreamedFile( response.body!, path, { filesize } );
	}
}

// ============================================================================
// Main Function
// ============================================================================

export class BlueprintFetchError extends Error {
	public readonly url: string;

	constructor( message: string, url: string, options?: ErrorOptions ) {
		super( message, options );
		this.name = 'BlueprintFetchError';
		this.url = url;
	}
}

/**
 * Resolves a remote blueprint from a URL.
 *
 * The blueprint can be either:
 * - A JSON file (blueprint.json) - additional resources will be fetched from the same base URL
 * - A ZIP file containing blueprint.json and bundled resources
 *
 * @param url - The URL of the blueprint to resolve.
 * @returns A promise that resolves to the resolved blueprint bundle (a readable filesystem).
 */
export async function resolveRemoteBlueprint( url: string ): Promise< BlueprintBundle > {
	let blueprintBytes: ArrayBuffer;
	try {
		const response = await fetch( url, {
			credentials: 'omit',
		} );
		if ( ! response.ok ) {
			throw new Error( `Failed to fetch blueprint from ${ url }` );
		}
		blueprintBytes = await response.arrayBuffer();
	} catch ( error ) {
		throw new BlueprintFetchError(
			`Blueprint file could not be resolved from ${ url }: ${
				error instanceof Error ? error.message : String( error )
			}`,
			url,
			{ cause: error }
		);
	}

	try {
		const blueprintText = new TextDecoder().decode( blueprintBytes );
		JSON.parse( blueprintText );

		// No exceptions, good! We're dealing with a JSON file. Let's
		// resolve the "bundled" resources from the same remote URL.
		return new OverlayFilesystem( [
			new InMemoryFilesystem( {
				'blueprint.json': blueprintText,
			} ),
			new FetchFilesystem( {
				baseUrl: url,
			} ),
		] );
	} catch ( error ) {
		// If the blueprint is not a JSON file, check if it's a ZIP file.
		if ( await looksLikeZipFile( blueprintBytes ) ) {
			return ZipFilesystem.fromArrayBuffer( blueprintBytes );
		}
		throw new Error( `Blueprint file at ${ url } is neither a valid JSON nor a ZIP file.`, {
			cause: error,
		} );
	}
}

async function looksLikeZipFile( bytes: ArrayBuffer ): Promise< boolean > {
	if ( bytes.byteLength < 4 ) {
		return false;
	}
	const filePrefix = new Uint8Array( bytes, 0, 4 );
	// Check against the signature for non-empty, non-spanned zip files.
	const matchesZipSignature =
		filePrefix[ 0 ] === 0x50 &&
		filePrefix[ 1 ] === 0x4b &&
		filePrefix[ 2 ] === 0x03 &&
		filePrefix[ 3 ] === 0x04;
	return matchesZipSignature;
}
