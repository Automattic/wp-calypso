// NOTE: This file has been copied mostly verbatim from Redpop/Tumblr. The main
// purpose is to stub basic Sentry methods so that consumers in Calypso can use
// them. Then we can async-load Sentry for only a certain percent of requests.
// Otherwise, we'd add a fair amount to the bundle size when we don't really need
// it for every single request.
import config from '@automattic/calypso-config';
import type * as SentryApi from '@sentry/react';

// Static sentry configuration. We add any dynamic values when initializing Sentry.
const SENTRY_CONFIG: SentryApi.BrowserOptions = {
	dsn: 'https://61275d63a504465ab315245f1a379dab@o248881.ingest.sentry.io/6313676',
	// Determine the sample of errors collected where 1.0 is 100% of errors.
	sampleRate: 1.0, // We're disabling it for 90% of requests, so we should track 100% of errors for the remaining 10% of requests.
	// Don't track errors on these URLs.
	denyUrls: [
		// Matches browser extension URLs, like "moz-extension://..." or "safari-web-extension://..."
		/^[a-z]+(-[a-z]+)?-extension:\/\//i,
	],
};

type SupportedMethods =
	| 'addBreadcrumb'
	| 'captureEvent'
	| 'captureException'
	| 'captureMessage'
	| 'configureScope'
	| 'withScope';
interface QueueDataMethod< Method extends SupportedMethods > {
	f: Method;
	a: Parameters< ( typeof SentryApi )[ Method ] >;
}

let callQueue: Array< Readonly< QueueDataMethod< SupportedMethods > > > = [];
let errorQueue: Array< Readonly< Parameters< OnErrorEventHandlerNonNull > > > = [];
let rejectionQueue: Array< PromiseRejectionEvent > = [];
function clearQueues() {
	callQueue = [];
	errorQueue = [];
	rejectionQueue = [];
}

type SentryState =
	// Nothing started
	| { state: 'initial' }
	// Queued load
	| { state: 'loading'; params: SentryOptions }
	// Load failed
	| { state: 'error'; params: SentryOptions }
	// Sentry will not be enabled
	| { state: 'disabled'; params: SentryOptions }
	// Fully loaded!
	| { state: 'loaded'; params: SentryOptions; sentry: typeof import('@sentry/react') };
let state: SentryState = { state: 'initial' };

function dispatchSentryMethodCall< Method extends SupportedMethods >(
	method: Method,
	args: Parameters< ( typeof SentryApi )[ Method ] >
) {
	const { state: status } = state;
	if ( status === 'loaded' ) {
		// @ts-expect-error We have a union of tuples and TypeScript wants a Tuple. It's OK.
		state.sentry[ method ]( ...args );
		return;
	}
	if ( status === 'error' || status === 'disabled' ) {
		return;
	}
	callQueue.push( { f: method, a: args } );
}
export function addBreadcrumb( ...args: Parameters< typeof SentryApi.addBreadcrumb > ) {
	dispatchSentryMethodCall( 'addBreadcrumb', args );
}
export function captureEvent( ...args: Parameters< typeof SentryApi.captureEvent > ) {
	dispatchSentryMethodCall( 'captureEvent', args );
}
export function captureException( ...args: Parameters< typeof SentryApi.captureException > ) {
	dispatchSentryMethodCall( 'captureException', args );
}
export function captureMessage( ...args: Parameters< typeof SentryApi.captureMessage > ) {
	dispatchSentryMethodCall( 'captureMessage', args );
}
export function configureScope( ...args: Parameters< typeof SentryApi.configureScope > ) {
	dispatchSentryMethodCall( 'configureScope', args );
}
export function withScope( ...args: Parameters< typeof SentryApi.withScope > ) {
	dispatchSentryMethodCall( 'withScope', args );
}

// Replays all calls to the Sentry API
function processErrorQueue() {
	for ( const call of callQueue ) {
		// @ts-expect-error We have a union of tuples and TypeScript wants a Tuple. It's OK.
		state.sentry[ call.f ]( ...call.a );
	}

	// And now capture all previously caught exceptions
	// Because we installed the SDK, at this point we have an access to TraceKit's handler,
	// which can take care of browser differences (eg. missing exception argument in onerror)
	if ( window.onerror ) {
		for ( const error of errorQueue ) {
			window.onerror( ...error );
		}
	}
	if ( window.onunhandledrejection ) {
		for ( const rejection of rejectionQueue ) {
			window.onunhandledrejection( rejection );
		}
	}
}

function beforeBreadcrumb( breadcrumb: SentryApi.Breadcrumb ): SentryApi.Breadcrumb | null {
	// Ignore default navigation events -- we'll track them ourselves in the page( '*' ) handler.
	if ( breadcrumb.category === 'navigation' && ! breadcrumb.data?.should_capture ) {
		return null;
	} else if ( breadcrumb.data?.should_capture ) {
		delete breadcrumb.data.should_capture;
	}
	return breadcrumb;
}

function shouldEnableSentry( sampleRate: number ): boolean {
	// This flag overrides the other settings, always enabling Sentry:
	if ( config.isEnabled( 'always-enable-sentry' ) ) {
		return true;
	}

	// By default, only load for 10% of requests when Sentry is enabled in the environment:
	return (
		config.isEnabled( 'catch-js-errors' ) &&
		Math.ceil( Math.random() * 10 ) <= Math.floor( sampleRate * 10 )
	);
}

interface SentryOptions {
	beforeSend?: ( e: SentryApi.Event ) => SentryApi.Event | null;
	userId?: number;
	sampleRate?: number;
}

/**
 * Sentry initialization function.
 * It can be called multiple times, but it will only initialize Sentry once, if the sampleRate is met (default 10%).
 * It stores the previous execution parameters, and will use them as default if the function is called again.
 * @param parameters Initialization parameters
 * @returns A promise that resolves to the previous state of Sentry (enabled/disabled)
 */
export async function initSentry( parameters?: SentryOptions ) {
	// Make sure we don't throw
	try {
		// No Sentry loading on the server.
		// No double-loading.
		// No initializing with empty params
		if (
			typeof document === 'undefined' ||
			( state.state === 'initial' && ! parameters ) ||
			! [ 'initial', 'disabled' ].includes( state.state )
		) {
			return 'enabled'; // Previous state: enabled -> We're already running [loading, loaded, error]
		}

		// We use previous invocation parameters here, allowing the user to override any of them
		// We need this because some of the params are initialized at app boot, and can't be recreated when the app is already running
		const params =
			state.state === 'initial'
				? ( parameters as SentryOptions ) // We know it's not undefined because of the check above
				: { ...state.params, sampleRate: 0.1, ...parameters };

		const { beforeSend, userId, sampleRate = 0.1 } = params;

		state = { state: 'loading', params };

		// Set state to disabled when we know we won't enable it for this request.
		if ( ! shouldEnableSentry( sampleRate ) ) {
			state = { state: 'disabled', params };
			// Note that the `clearQueues()` call in the finally block is still
			// executed after returning here, so cleanup does happen correctly.
			return 'disabled'; // Previous state: disabled -> We were not running [initial, disabled]
		}

		// eslint-disable-next-line no-console
		console.info( 'Initializing error reporting...' );

		const errorHandler = ( errorEvent: ErrorEvent ): void =>
			void errorQueue.push( [
				errorEvent.message,
				errorEvent.filename,
				errorEvent.lineno,
				errorEvent.colno,
				errorEvent.error,
			] );
		const rejectionHandler = ( exceptionEvent: PromiseRejectionEvent ): void =>
			void rejectionQueue.push(
				// Sentry does this, presumably for browsers being browsers 🤷
				// https://github.com/getsentry/sentry-javascript/blob/4793df5f515575703d9c83ebf4159ac145478410/packages/browser/src/loader.js#L205
				// @ts-expect-error Fixing up browser weirdness
				exceptionEvent?.reason ?? exceptionEvent?.detail?.reason ?? exceptionEvent
			);

		window.addEventListener( 'error', errorHandler );
		window.addEventListener( 'unhandledrejection', rejectionHandler );

		try {
			const Sentry = await import( '@sentry/react' );
			// We don't set a release outside of production builds because we don't
			// really "release" anything other than new deploys from trunk builds.
			// wpcalypso (calypso.live) runs on PRs, which doesn't really map to a
			// release we need to track. Horizon is just a different flavor of trunk,
			// so it can be mapped to a trunk release.
			const environment = config< string >( 'env_id' );
			const release =
				environment === 'production' || environment === 'horizon'
					? `calypso_${ window.COMMIT_SHA }`
					: undefined;

			// Remove our handlers when we're loaded and ready to init
			window.removeEventListener( 'error', errorHandler );
			window.removeEventListener( 'unhandledrejection', rejectionHandler );

			// See configuration docs: https://docs.sentry.io/clients/javascript/config
			Sentry.init( {
				...SENTRY_CONFIG,
				initialScope: {
					user: { id: userId?.toString() },
				},
				environment,
				release,
				beforeBreadcrumb,
				beforeSend,
			} );
			state = { state: 'loaded', params, sentry: Sentry };
		} catch ( err ) {
			state = { state: 'error', params };
			// Make sure handlers are removed if Sentry fails
			window.removeEventListener( 'error', errorHandler );
			window.removeEventListener( 'unhandledrejection', rejectionHandler );
			throw err;
		}

		processErrorQueue();
	} catch ( o_O ) {
		// eslint-disable-next-line no-console
		console.error( o_O );
	} finally {
		// Clear queues. We've either drained them or errored trying to load Sentry.
		// Either way they don't serve a purpose.
		clearQueues();
	}

	return 'disabled'; // Previous state: disabled -> We were not running [initial, disabled]
}

/**
 * Sentry cleanup function.
 * It will close the Sentry instance if it was successfully initialized.
 */
export function closeSentry() {
	if ( state.state === 'loaded' ) {
		state.sentry.close();
	}
}
