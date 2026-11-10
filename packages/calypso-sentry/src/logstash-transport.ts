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

// Sentry backs off when its server says so; logstash never does, so cap the
// copies ourselves to keep an error loop from flooding the endpoint.
const MAX_EVENTS_PER_WINDOW = 10;
const WINDOW_MS = 60 * 1000;

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

function formatFrame( frame: SentryApi.StackFrame ): string {
	return `${ frame.function ?? '?' } (${ frame.filename ?? '?' }:${ frame.lineno ?? '?' }:${
		frame.colno ?? '?'
	})`;
}

function formatStackTrace( frames: SentryApi.StackFrame[] | undefined ): string | undefined {
	if ( ! frames?.length ) {
		return undefined;
	}

	// Sentry orders frames oldest first; a JS stack trace lists the newest first.
	return [ ...frames ]
		.reverse()
		.map( ( frame ) => `at ${ formatFrame( frame ) }` )
		.join( '\n' );
}

// FNV-1a: a short, synchronous hash so identical stacks share a filterable key.
function hashString( text: string ): string {
	let hash = 0x811c9dc5;
	for ( let i = 0; i < text.length; i++ ) {
		hash = Math.imul( hash ^ text.charCodeAt( i ), 0x01000193 );
	}
	return ( hash >>> 0 ).toString( 16 ).padStart( 8, '0' );
}

// Minified names and columns change whenever a chunk does, so this only groups
// events thrown by the same build of each chunk in the stack.
function stackHash( exception: SentryApi.Exception | undefined ): string | undefined {
	const frames = exception?.stacktrace?.frames;
	if ( ! frames?.length ) {
		return undefined;
	}

	return hashString( [ exception?.type, ...frames.map( formatFrame ) ].join( '\n' ) );
}

function truncate( text: string, maxLength: number ): string {
	return text.length > maxLength ? `${ text.slice( 0, maxLength - 1 ) }…` : text;
}

function toTagValue( value: unknown ): string | undefined {
	return value === undefined || value === null || value === '' ? undefined : String( value );
}

function toPropertyKey( name: string ): string {
	return name
		.replace( /([a-z0-9])([A-Z])/g, '$1_$2' )
		.replace( /([A-Z]+)([A-Z][a-z])/g, '$1_$2' )
		.replace( /[^A-Za-z0-9]+/g, '_' )
		.toLowerCase();
}

// Logstash only indexes scalar properties, so each Sentry tag becomes its own
// string property. Dots would be read as nesting, hence the key sanitizing.
function tagProperties( tags: SentryApi.Event[ 'tags' ] ): Record< string, string | undefined > {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const { calypso_section, blog_id, ...rest } = tags ?? {};
	return Object.fromEntries(
		Object.entries( rest ).map( ( [ name, value ] ) => [
			`tag_${ toPropertyKey( name ) }`,
			toTagValue( value ),
		] )
	);
}

function lastNavigationRoute( breadcrumbs: SentryApi.Breadcrumb[] | undefined ) {
	const navigation = breadcrumbs
		?.slice()
		.reverse()
		.find( ( crumb ) => crumb.category === 'navigation' );
	return toTagValue( redactIfString( navigation?.data?.to ) );
}

const SECRET_PARAM_NAME =
	/^(?:code|token|jwt|password|secret|key|nonce|_wpnonce|signature)$|_(?:token|secret|key)$/i;

// Covers the query string and fragment (OAuth implicit grants put tokens in
// the fragment), and relative URLs from fetch breadcrumbs.
export function redactUrl( url: string ): string {
	return url.replace( /([?&#])([^=&#]+)=([^&#]*)/g, ( match, separator, name ) =>
		SECRET_PARAM_NAME.test( name ) ? `${ separator }${ name }=redacted` : match
	);
}

function redactIfString< T >( value: T ): T {
	return ( typeof value === 'string' ? redactUrl( value ) : value ) as T;
}

function redactQueryString( query: SentryApi.Request[ 'query_string' ] ) {
	if ( typeof query === 'string' ) {
		return redactUrl( `?${ query }` ).slice( 1 );
	}
	const entries = Array.isArray( query ) ? query : Object.entries( query ?? {} );
	const redacted = entries.map( ( [ name, value ] ): [ string, string ] => [
		name,
		SECRET_PARAM_NAME.test( name ) ? 'redacted' : value,
	] );
	return Array.isArray( query ) ? redacted : Object.fromEntries( redacted );
}

function redactBreadcrumb( crumb: SentryApi.Breadcrumb ): SentryApi.Breadcrumb {
	if ( ! crumb.data ) {
		return crumb;
	}

	const data = { ...crumb.data };
	for ( const key of [ 'url', 'from', 'to' ] ) {
		if ( key in data ) {
			data[ key ] = redactIfString( data[ key ] );
		}
	}
	return { ...crumb, data };
}

function serializeExtra( event: SentryApi.Event ) {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const { headers, ...request } = event.request ?? {};

	return JSON.stringify( {
		...event,
		...( event.request
			? {
					request: {
						...request,
						url: redactIfString( request.url ),
						...( request.query_string
							? { query_string: redactQueryString( request.query_string ) }
							: {} ),
					},
				}
			: {} ),
		breadcrumbs: event.breadcrumbs?.slice( -MAX_BREADCRUMBS ).map( redactBreadcrumb ),
	} );
}

export function eventToLogstashPayload( event: SentryApi.Event ): LogstashPayload {
	// The primary exception is the last one; earlier entries are its causes.
	const exception = event.exception?.values?.at( -1 );
	const frames = exception?.stacktrace?.frames;
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
		trace: formatStackTrace( frames ),
		properties: {
			event_id: event.event_id,
			env_id: event.environment,
			release: event.release,
			url: redactIfString( event.request?.url ),
			exception_type: exception?.type,
			handled: exception?.mechanism?.handled,
			mechanism: exception?.mechanism?.type,
			fingerprint: event.fingerprint?.join( ',' ),
			calypso_section: calypsoSection,
			blog_id: toTagValue( event.tags?.blog_id ),
			route: lastNavigationRoute( event.breadcrumbs ),
			trace_id: toTagValue( event.contexts?.trace?.trace_id ),
			sdk_version: event.sdk?.version,
			stack_hash: stackHash( exception ),
			top_frame: frames?.length ? formatFrame( frames[ frames.length - 1 ] ) : undefined,
			...tagProperties( event.tags ),
		},
		extra: serializeExtra( event ),
	};
}

function createLogstashSender() {
	let pendingBytes = 0;
	let pendingCount = 0;
	let recentSendTimes: number[] = [];
	let throttledCount = 0;

	function isThrottled( now: number ) {
		recentSendTimes = recentSendTimes.filter( ( time ) => now - time < WINDOW_MS );
		if ( recentSendTimes.length >= MAX_EVENTS_PER_WINDOW ) {
			throttledCount++;
			return true;
		}
		recentSendTimes.push( now );
		return false;
	}

	function send( event: SentryApi.Event ) {
		if ( isThrottled( Date.now() ) ) {
			return;
		}

		const payload = eventToLogstashPayload( event );
		if ( throttledCount > 0 ) {
			payload.properties.throttled_count = throttledCount;
			throttledCount = 0;
		}

		const body = new URLSearchParams( { params: JSON.stringify( payload ) } );
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
				try {
					sendToLogstash( envelope );
				} catch {
					// Never let the logstash copy interfere with delivery to Sentry.
				}
				return sentryTransport.send( envelope );
			},
			flush( timeout ) {
				return sentryTransport.flush( timeout );
			},
		};
	};
}
