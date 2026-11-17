import { logToLogstash } from '@automattic/api-core';
import { bumpStat } from '../rest-client/bump-stat';

/**
 * Send an error to logstash. Fire-and-forget: logging must never throw and
 * take down the surface it is trying to report on.
 * @param error The error (or error-like value) to report.
 * @param extra Optional structured context to attach to the log entry.
 */
export function logError( error: unknown, extra?: Record< string, unknown > ) {
	// wpcom request callbacks hand back plain error objects (with `message`,
	// `error` code and `status`), not always real Error instances — normalize
	// both so the message and stack survive into the log entry.
	const isObject = !! error && typeof error === 'object';
	const message =
		error instanceof Error
			? error.message
			: ( isObject && String( ( error as { message?: unknown } ).message ?? '' ) ) || '';
	const stack = error instanceof Error ? error.stack : undefined;

	try {
		logToLogstash( {
			feature: 'calypso_client',
			message: message || 'Unknown error',
			tags: [ 'notifications' ],
			extra: {
				stack,
				...extra,
			},
		} ).catch( () => {} );
	} catch {
		// Never let logging crash the app.
	}
}

/**
 * Count a failed notifications request or action in the `notes-error` stat, and send its details to logstash.
 * @param action What failed, e.g. `load`, `reply` or `like`. Used as the stat value.
 * @param error The error (or error-like value) to report.
 * @param extra Optional structured context to attach to the log entry.
 */
export function reportError( action: string, error: unknown, extra?: Record< string, unknown > ) {
	bumpStat( 'notes-error', action );
	logError( error, { action, ...extra } );
}
