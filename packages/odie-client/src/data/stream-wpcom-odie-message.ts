import apiFetch from '@wordpress/api-fetch';
import wpcomRequest, { canAccessWpcomApis } from 'wpcom-proxy-request';
import type { ReturnedChat } from '../types';

interface StreamOptions {
	body: Record< string, unknown >;
	token: string;
	onDelta: ( content: string ) => void;
	onProgress?: ( summary: string ) => void;
	signal?: AbortSignal;
}

/**
 * The stream is fetched from public-api directly, since neither the wpcom proxy nor the
 * Jetpack proxy can pass a response through as it arrives. A JWT stands in for the cookie.
 */
export const requestOdieStreamToken = async (): Promise< string | null > => {
	try {
		const { token } = canAccessWpcomApis()
			? await wpcomRequest< { token: string } >( {
					path: '/ai/jwt',
					apiNamespace: 'wpcom/v2',
					method: 'POST',
				} )
			: await apiFetch< { token: string } >( {
					path: '/jetpack/v4/jetpack-ai-jwt',
					method: 'POST',
				} );

		return token || null;
	} catch {
		return null;
	}
};

export const streamWpcomOdieMessage = async (
	path: string,
	{ body, token, onDelta, onProgress, signal }: StreamOptions
): Promise< ReturnedChat > => {
	const response = await fetch( `https://public-api.wordpress.com/wpcom/v2${ path }`, {
		body: JSON.stringify( { ...body, stream: true } ),
		credentials: 'omit',
		headers: { Authorization: `Bearer ${ token }`, 'Content-Type': 'application/json' },
		method: 'POST',
		signal,
	} );

	// Refusals before generation, and bots that are not workflows, answer with plain JSON.
	if (
		! response.body ||
		! response.headers.get( 'Content-Type' )?.startsWith( 'text/event-stream' )
	) {
		const data = ( await response.json() ) as ReturnedChat & { message?: string };

		if ( ! response.ok ) {
			throw new Error( `${ response.status } ${ data.message || response.statusText }` );
		}

		return data;
	}

	const reader = response.body.getReader();
	const decoder = new TextDecoder();
	let pending = '';

	for (;;) {
		const { done, value } = await reader.read();

		if ( done ) {
			throw new Error( 'The reply stream ended before the reply was complete.' );
		}

		pending += decoder.decode( value, { stream: true } );
		const events = pending.split( '\n\n' );
		pending = events.pop() ?? '';

		for ( const event of events ) {
			const [ , name, json ] = event.match( /^event: (\w+)\ndata: (.*)$/s ) ?? [];
			const data = json ? JSON.parse( json ) : null;

			if ( name === 'delta' ) {
				onDelta( data.content );
			} else if ( name === 'progress' ) {
				onProgress?.( data.summary );
			} else if ( name === 'complete' ) {
				return data;
			} else if ( name === 'error' ) {
				throw new Error( `${ data.data?.status } ${ data.message }` );
			}
		}
	}
};
