import { useCallback, useEffect, useRef, useState } from '@wordpress/element';
import type { UseAgentChatConfig } from '@automattic/agenttic-client';

interface TraceCapture {
	messageId: string;
	traceId: string;
}

function isRecord( value: unknown ): value is Record< string, unknown > {
	return typeof value === 'object' && value !== null;
}

function getString( value: unknown ): string | undefined {
	return typeof value === 'string' && value ? value : undefined;
}

function getTraceCaptureFromEvent( event: unknown ): TraceCapture | undefined {
	if ( ! isRecord( event ) || ! isRecord( event.result ) ) {
		return undefined;
	}

	const traceId = getString( event.result.traceId );
	if (
		! traceId ||
		! isRecord( event.result.status ) ||
		! isRecord( event.result.status.message )
	) {
		return undefined;
	}

	const messageId = getString( event.result.status.message.messageId );
	return messageId ? { messageId, traceId } : undefined;
}

function getTraceCapturesFromJson( json: unknown ): TraceCapture[] {
	const capture = getTraceCaptureFromEvent( json );
	return capture ? [ capture ] : [];
}

function parseSseEvents( text: string ): unknown[] {
	const events: unknown[] = [];
	let data = '';

	for ( const line of text.split( /\r?\n/ ) ) {
		if ( line.startsWith( 'data:' ) ) {
			data += ( data ? '\n' : '' ) + line.slice( line.startsWith( 'data: ' ) ? 6 : 5 );
			continue;
		}

		if ( line.trim() === '' && data ) {
			try {
				events.push( JSON.parse( data ) );
			} catch {}
			data = '';
		}
	}

	if ( data ) {
		try {
			events.push( JSON.parse( data ) );
		} catch {}
	}

	return events;
}

function getTraceCapturesFromResponseText(
	text: string,
	contentType: string | null
): TraceCapture[] {
	if ( contentType?.includes( 'text/event-stream' ) ) {
		return parseSseEvents( text ).flatMap( getTraceCapturesFromJson );
	}

	try {
		return getTraceCapturesFromJson( JSON.parse( text ) );
	} catch {
		return [];
	}
}

function requestUrlMatchesAgent(
	input: RequestInfo | URL,
	agentUrl: string,
	agentId: string
): boolean {
	const url = typeof input === 'string' || input instanceof URL ? input.toString() : input.url;
	return url === `${ agentUrl }/${ agentId }`;
}

export default function useAgentTraceIds( agentConfig?: UseAgentChatConfig | null ) {
	const traceIdsByMessageIdRef = useRef< Map< string, string > >( new Map() );
	const [ , setTraceIdsByMessageId ] = useState< Map< string, string > >(
		traceIdsByMessageIdRef.current
	);

	useEffect( () => {
		if (
			! agentConfig?.agentUrl ||
			! agentConfig?.agentId ||
			typeof window === 'undefined' ||
			typeof window.fetch !== 'function'
		) {
			return;
		}

		const originalFetch = window.fetch.bind( window );
		window.fetch = ( async ( input: RequestInfo | URL, init?: RequestInit ) => {
			const response = await originalFetch( input, init );

			if ( requestUrlMatchesAgent( input, agentConfig.agentUrl, agentConfig.agentId ) ) {
				void response
					.clone()
					.text()
					.then( ( text ) => {
						const captures = getTraceCapturesFromResponseText(
							text,
							response.headers.get( 'content-type' )
						);
						if ( captures.length === 0 ) {
							return;
						}

						setTraceIdsByMessageId( ( previous ) => {
							const next = new Map( traceIdsByMessageIdRef.current );
							let changed = false;
							for ( const { messageId, traceId } of captures ) {
								if ( next.get( messageId ) !== traceId ) {
									next.set( messageId, traceId );
									changed = true;
								}
							}
							if ( ! changed ) {
								return previous;
							}
							traceIdsByMessageIdRef.current = next;
							return next;
						} );
					} )
					.catch( () => {} );
			}

			return response;
		} ) as typeof window.fetch;

		return () => {
			window.fetch = originalFetch;
		};
	}, [ agentConfig?.agentId, agentConfig?.agentUrl ] );

	return useCallback(
		( messageId: string ) => traceIdsByMessageIdRef.current.get( messageId ),
		[]
	);
}
