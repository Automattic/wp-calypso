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
	| { state: 'loading' }
	// Load failed
	| { state: 'error' }
	// Sentry will not be enabled
	| { state: 'disabled' }
	// Fully loaded!
	| { state: 'loaded'; sentry: typeof import('@sentry/react') };
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

interface SentryOptions {
	beforeSend: ( e: SentryApi.Event ) => SentryApi.Event | null;
	userId?: number;
}
export async function initSentry( { beforeSend, userId }: SentryOptions ) {
	// Make sure we don't throw
	try {
		// No Sentry loading on the server.
		// No double-loading.
		if ( typeof document === 'undefined' || state.state !== 'initial' ) {
			return;
		}
		state = { state: 'loading' };

		// Enable Sentry only for 10% of requests or always in calypso.live for testing.
		// Always disable if catch-js-errors is not available in the environment.
		if (
			! (
				config.isEnabled( 'catch-js-errors' ) &&
				( config( 'env_id' ) === 'wpcalypso' || Math.floor( Math.random() * 10 ) === 1 )
			)
		) {
			// Set state to disabled to stop maintaining a queue of sentry method calls.
			state = { state: 'disabled' };
			// Note that the `clearQueues()` call in the finally block is still
			// executed after returning here, so cleanup does happen correctly.
			return;
		}

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
				// eslint-disable-next-line no-nested-ternary
				'reason' in exceptionEvent
					? exceptionEvent.reason
					: // @ts-expect-error Fixing up browser weirdness
					'detail' in exceptionEvent && 'reason' in exceptionEvent.detail
					? // @ts-expect-error Fixing up browser weirdness
					  exceptionEvent.detail.reason
					: exceptionEvent
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
			state = { state: 'loaded', sentry: Sentry };
		} catch ( err ) {
			state = { state: 'error' };
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
}
