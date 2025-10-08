import { mayWeTrackByTracker } from '../tracker-buckets';
import { debug, TRACKING_IDS } from './constants';

/**
 * Fires a Google Ads conversion event for migration tracking
 * @param {string} eventName - The name of the migration event (e.g., 'Migration Start', 'Migration Credentials Submit')
 * @param {string} trackingId - The tracking ID from TRACKING_IDS to use for the event
 * @param {string} componentName - The name of the component firing the event (for debug logging)
 * @returns {void}
 */
export function recordMigrationEvent( eventName, trackingId, componentName ) {
	if ( ! mayWeTrackByTracker( 'googleAds' ) ) {
		debug( `${ componentName }: skipping Google Ads tracking as ad tracking is disallowed` );
		return;
	}

	const params = [
		'event',
		'conversion',
		{
			send_to: trackingId,
		},
	];
	debug( `${ componentName }: [Google Ads Gtag] ${ eventName }`, params );
	window.gtag( ...params );
}

/**
 * Fires a Google Ads conversion event for migration start
 * @param {string} componentName - The name of the component firing the event
 * @returns {void}
 */
export function recordMigrationStartEvent( componentName ) {
	recordMigrationEvent(
		'Migration Start',
		TRACKING_IDS.wpcomGoogleAdsGtagMigrationFlowStart,
		componentName
	);
}

/**
 * Fires a Google Ads conversion event for migration credentials submission
 * @param {string} componentName - The name of the component firing the event
 * @returns {void}
 */
export function recordMigrationCredentialsEvent( componentName ) {
	recordMigrationEvent(
		'Migration Credentials Submit',
		TRACKING_IDS.wpcomGoogleAdsGtagMigrationCredentials,
		componentName
	);
}

/**
 * Fires a Google Ads conversion event for migration signup start
 * @param {string} componentName - The name of the component firing the event
 * @returns {void}
 */
export function recordMigrationSignupEvent( componentName ) {
	recordMigrationEvent(
		'Migration Signup Start',
		TRACKING_IDS.wpcomGoogleAdsGtagMigrationSignupStart,
		componentName
	);
}

/**
 * Fires a Facebook custom event for migration start
 * @param {string} componentName - The name of the component firing the event
 * @returns {void}
 */
export function recordMigrationStartFacebookEvent( componentName ) {
	if ( ! mayWeTrackByTracker( 'facebook' ) ) {
		debug( `${ componentName }: skipping Facebook tracking as ad tracking is disallowed` );
		return;
	}

	const params = [ 'trackCustom', 'MigrationStart' ];
	debug( `${ componentName }: [Facebook] Migration Start`, params );
	window.fbq( ...params );
}

/**
 * Fires a Facebook custom event for migration credentials submission
 * @param {string} componentName - The name of the component firing the event
 * @returns {void}
 */
export function recordMigrationRequestSubmittedFacebookEvent( componentName ) {
	if ( ! mayWeTrackByTracker( 'facebook' ) ) {
		debug( `${ componentName }: skipping Facebook tracking as ad tracking is disallowed` );
		return;
	}

	const params = [ 'trackCustom', 'MigrationRequestSubmitted' ];
	debug( `${ componentName }: [Facebook] Migration Request Submitted`, params );
	window.fbq( ...params );
}

/**
 * Fires a Facebook custom event for migration signup start
 * @param {string} componentName - The name of the component firing the event
 * @returns {void}
 */
export function recordMigrationSignupFacebookEvent( componentName ) {
	if ( ! mayWeTrackByTracker( 'facebook' ) ) {
		debug( `${ componentName }: skipping Facebook tracking as ad tracking is disallowed` );
		return;
	}

	const params = [ 'trackCustom', 'MigrationSignup' ];
	debug( `${ componentName }: [Facebook] Migration Signup`, params );
	window.fbq( ...params );
}
