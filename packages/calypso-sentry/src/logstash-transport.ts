import type * as SentryApi from '@sentry/react';

type Transport = ReturnType< typeof SentryApi.makeFetchTransport >;
type TransportOptions = Parameters< typeof SentryApi.makeFetchTransport >[ 0 ];
type Envelope = Parameters< Transport[ 'send' ] >[ 0 ];

const LOGSTASH_URL = 'https://public-api.wordpress.com/rest/v1.1/logstash';

// Browsers fail `keepalive` requests once the in-flight ones total more than
// 64 KiB, so (like Sentry's own transport) only use it below that.
const MAX_KEEPALIVE_BYTES = 60000;
const MAX_KEEPALIVE_REQUESTS = 15;
const MAX_BREADCRUMBS = 20;
const MAX_MESSAGE_LENGTH = 10 * 1024;

export interface LogstashPayload {
	feature: 'calypso_client';
	message: string;
	severity: string;
	tags: string[];
	user_id?: number;
	trace?: string;
	properties: Record< string, string | number | boolean | undefined >;
	extra?: string;
}

function toSeverity( level: SentryApi.SeverityLevel | undefined ): string {
	switch ( level ) {
		case 'fatal':
			return 'error';
		case 'log':
			return 'info';
		default:
			return level ?? 'error';
	}
}

function formatStackTrace( frames: SentryApi.StackFrame[] | undefined ): string | undefined {
	if ( ! frames?.length ) {
		return undefined;
	}

	// Sentry orders frames oldest first; a JS stack trace lists the newest first.
	return [ ...frames ]
		.reverse()
		.map(
			( frame ) =>
				`at ${ frame.function ?? '?' } (${ frame.filename ?? '?' }:${ frame.lineno ?? '?' }:${
					frame.colno ?? '?'
				})`
		)
		.join( '\n' );
}

function truncate( text: string, maxLength: number ): string {
	return text.length > maxLength ? `${ text.slice( 0, maxLength - 1 ) }…` : text;
}

function toTagValue( value: unknown ): string | undefined {
	return value === undefined || value === null || value === '' ? undefined : String( value );
}

function serializeExtra( event: SentryApi.Event ) {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const { headers, ...request } = event.request ?? {};

	return JSON.stringify( {
		...event,
		...( event.request ? { request } : {} ),
		breadcrumbs: event.breadcrumbs?.slice( -MAX_BREADCRUMBS ),
	} );
}

export function eventToLogstashPayload( event: SentryApi.Event ): LogstashPayload {
	// The primary exception is the last one; earlier entries are its causes.
	const exception = event.exception?.values?.at( -1 );
	const message = exception
		? [ exception.type, exception.value ].filter( Boolean ).join( ': ' )
		: ( event.message ?? '' );
	const calypsoSection = toTagValue( event.tags?.calypso_section );
	const userId = Number( event.user?.id );

	return {
		feature: 'calypso_client',
		message: truncate( message || '(no message)', MAX_MESSAGE_LENGTH ),
		severity: toSeverity( event.level ),
		tags: [ 'sentry_transport', ...( calypsoSection ? [ calypsoSection ] : [] ) ],
		...( Number.isFinite( userId ) && userId > 0 ? { user_id: userId } : {} ),
		trace: formatStackTrace( exception?.stacktrace?.frames ),
		properties: {
			event_id: event.event_id,
			env_id: event.environment,
			release: event.release,
			url: event.request?.url,
			exception_type: exception?.type,
			handled: exception?.mechanism?.handled,
			mechanism: exception?.mechanism?.type,
			fingerprint: event.fingerprint?.join( ',' ),
			calypso_section: calypsoSection,
			blog_id: toTagValue( event.tags?.blog_id ),
		},
		extra: serializeExtra( event ),
	};
}

function createLogstashSender() {
	let pendingBytes = 0;
	let pendingCount = 0;

	function send( event: SentryApi.Event ) {
		const body = new URLSearchParams( {
			params: JSON.stringify( eventToLogstashPayload( event ) ),
		} );
		const bodySize = body.toString().length;
		pendingBytes += bodySize;
		pendingCount++;

		const settle = () => {
			pendingBytes -= bodySize;
			pendingCount--;
		};

		try {
			fetch( LOGSTASH_URL, {
				method: 'POST',
				body,
				credentials: 'omit',
				keepalive: pendingBytes <= MAX_KEEPALIVE_BYTES && pendingCount < MAX_KEEPALIVE_REQUESTS,
			} ).then( settle, settle );
		} catch {
			// Never let the logstash copy interfere with delivery to Sentry.
			settle();
		}
	}

	return ( envelope: Envelope ) => {
		if ( typeof fetch !== 'function' ) {
			return;
		}

		for ( const [ itemHeaders, item ] of envelope[ 1 ] ) {
			if ( itemHeaders.type === 'event' ) {
				send( item as SentryApi.Event );
			}
		}
	};
}

/**
 * Wraps Sentry's fetch transport so that every error event is also sent to
 * logstash. Sentry's response is always the one returned, so a logstash
 * failure can't affect Sentry delivery or rate limiting.
 */
export function makeLogstashMirrorTransport(
	makeFetchTransport: typeof SentryApi.makeFetchTransport
) {
	return ( options: TransportOptions ): Transport => {
		const sentryTransport = makeFetchTransport( options );
		const sendToLogstash = createLogstashSender();

		return {
			send( envelope ) {
				sendToLogstash( envelope );
				return sentryTransport.send( envelope );
			},
			flush( timeout ) {
				return sentryTransport.flush( timeout );
			},
		};
	};
}
