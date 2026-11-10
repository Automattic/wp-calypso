// A minimal text/event-stream reader for a fetch() body. Unlike the agenttic
// parser it keeps `id:` and `retry:`, which the feed needs for its cursor and
// reconnect delay. `event:` is not needed: the event type travels in the data.

export type SseFrame = {
	id?: string;
	data: string;
};

export class SseParser {
	private buffer = '';
	private data: string[] = [];
	private id: string | undefined;
	retryMs: number | undefined;

	push( chunk: string ): SseFrame[] {
		this.buffer += chunk;
		const frames: SseFrame[] = [];
		let newline: number;
		while ( ( newline = this.buffer.search( /\r\n|\r|\n/ ) ) !== -1 ) {
			// A lone \r at the end of a chunk may be the first half of \r\n.
			if ( this.buffer[ newline ] === '\r' && newline === this.buffer.length - 1 ) {
				break;
			}
			const line = this.buffer.slice( 0, newline );
			const length = this.buffer.startsWith( '\r\n', newline ) ? 2 : 1;
			this.buffer = this.buffer.slice( newline + length );
			const frame = this.processLine( line );
			if ( frame ) {
				frames.push( frame );
			}
		}
		return frames;
	}

	private processLine( line: string ): SseFrame | null {
		if ( line === '' ) {
			if ( this.data.length === 0 ) {
				this.id = undefined;
				return null;
			}
			const frame = { id: this.id, data: this.data.join( '\n' ) };
			this.data = [];
			this.id = undefined;
			return frame;
		}
		if ( line.startsWith( ':' ) ) {
			return null;
		}
		const colon = line.indexOf( ':' );
		const field = colon === -1 ? line : line.slice( 0, colon );
		let value = colon === -1 ? '' : line.slice( colon + 1 );
		if ( value.startsWith( ' ' ) ) {
			value = value.slice( 1 );
		}
		if ( field === 'data' ) {
			this.data.push( value );
		} else if ( field === 'id' ) {
			this.id = value;
		} else if ( field === 'retry' && /^\d+$/.test( value ) ) {
			this.retryMs = Number( value );
		}
		return null;
	}
}

/**
 * Reads frames until the server ends the response. An unterminated trailing
 * frame is dropped, as a browser EventSource would: its cursor was never
 * confirmed, so the next connection asks for it again.
 */
export async function readSseStream(
	body: ReadableStream< Uint8Array >,
	onFrame: ( frame: SseFrame ) => void,
	parser: SseParser = new SseParser()
): Promise< void > {
	const reader = body.getReader();
	const decoder = new TextDecoder();
	try {
		for (;;) {
			const { done, value } = await reader.read();
			if ( done ) {
				break;
			}
			for ( const frame of parser.push( decoder.decode( value, { stream: true } ) ) ) {
				onFrame( frame );
			}
		}
		for ( const frame of parser.push( decoder.decode() ) ) {
			onFrame( frame );
		}
	} catch ( error ) {
		// A consumer that stops mid-response must not leave the connection open.
		await reader.cancel().catch( () => {} );
		throw error;
	} finally {
		reader.releaseLock();
	}
}
