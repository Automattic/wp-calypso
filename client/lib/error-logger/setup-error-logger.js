import config from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { addBreadcrumb, initSentry } from '@automattic/calypso-sentry';
import { tracksEvents } from 'calypso/lib/analytics/tracks';
import Logger from 'calypso/lib/catch-js-errors';
import { getSiteFragment } from 'calypso/lib/route';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import { getSelectedSiteId, getSectionName } from 'calypso/state/ui/selectors';

export function setupErrorLogger( reduxStore ) {
	// Add a bit of metadata from the redux store to the sentry event.
	const beforeSend = ( event ) => {
		const state = reduxStore.getState();
		const tags = {
			blog_id: getSelectedSiteId( state ),
			calypso_section: getSectionName( state ),
		};

		event.tags = {
			...tags,
			...event.tags,
		};

		return event;
	};

	// Note that Sentry can disable itself and do some cleanup if needed, so we
	// run it before the catch-js-errors check. (Otherwise, cleanup would never
	// never happen.)
	initSentry( { beforeSend, userId: getCurrentUserId( reduxStore.getState() ) } );

	if ( ! config.isEnabled( 'catch-js-errors' ) ) {
		return;
	}

	// At this point, the normal error logger is still set up so that logstash
	// contains a definitive log of calypso errors.
	const errorLogger = new Logger();

	// Save errorLogger to a singleton for use in arbitrary logging.
	require( 'calypso/lib/catch-js-errors/log' ).registerLogger( errorLogger );

	// Save data to JS error logger
	errorLogger.saveDiagnosticData( {
		user_id: getCurrentUserId( reduxStore.getState() ),
		calypso_env: config( 'env_id' ),
	} );

	errorLogger.saveDiagnosticReducer( function () {
		const state = reduxStore.getState();
		return {
			blog_id: getSelectedSiteId( state ),
			calypso_section: getSectionName( state ),
		};
	} );

	tracksEvents.on( 'record-event', ( eventName, lastTracksEvent ) =>
		errorLogger.saveExtraData( { lastTracksEvent } )
	);

	let prevPath;
	page( '*', function ( context, next ) {
		const path = context.canonicalPath.replace(
			getSiteFragment( context.canonicalPath ),
			':siteId'
		);
		// Also save the context to Sentry for easier debugging.
		addBreadcrumb( {
			category: 'navigation',
			data: {
				from: prevPath ?? path,
				to: path,
				should_capture: true, // Hint that this is our own breadcrumb, not the default navigation one.
			},
		} );
		prevPath = path;
		errorLogger.saveNewPath( path );
		next();
	} );
}
