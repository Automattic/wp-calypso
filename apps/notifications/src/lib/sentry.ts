import * as Sentry from '@sentry/browser';

// The standalone notifications widget ships with no error reporting of its own,
// so boot failures (a hung proxy-auth request, a render crash) leave the user
// staring at a spinner with no signal on our side. Report through the shared
// Calypso Sentry project, tagged so widget events stay filterable.
const DSN = 'https://61275d63a504465ab315245f1a379dab@o248881.ingest.sentry.io/6313676';

let enabled = false;

const isProductionHost = () =>
	typeof window !== 'undefined' && window.location.hostname === 'widgets.wp.com';

/**
 * Initialize Sentry for the standalone notifications widget.
 *
 * Calling `Sentry.init` also installs the global `error` / `unhandledrejection`
 * handlers, so unhandled boot rejections are captured for free. Safe to call
 * more than once; only the first call takes effect.
 */
export function initSentry() {
	if ( enabled || typeof window === 'undefined' ) {
		return;
	}

	Sentry.init( {
		dsn: DSN,
		environment: isProductionHost() ? 'production' : 'development',
		// Errors only — no performance tracing — to keep the widget bundle light.
		// Active incident: capture every error until the failure modes are understood.
		sampleRate: 1.0,
		// Drop noise from browser extensions injecting into the iframe.
		denyUrls: [ /^[a-z]+(-[a-z]+)?-extension:\/\//i ],
	} );
	Sentry.setTags( { feature: 'notifications', surface: 'wp-admin-standalone' } );

	enabled = true;
}

/**
 * Report an error to Sentry. No-op until `initSentry` has run, so the shared
 * REST client stays silent on surfaces that never opt in (the old panel, the
 * in-Calypso popover).
 */
export function captureException( error: unknown, context?: Record< string, unknown > ) {
	if ( ! enabled ) {
		return;
	}
	Sentry.captureException( error, context ? { extra: context } : undefined );
}
