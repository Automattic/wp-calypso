import { getCurrentUser, recordTracksEvent, analyticsEvents } from '@automattic/calypso-analytics';
import config from '@automattic/calypso-config';
import { isMobile } from '@automattic/viewport';
import debug from 'debug';
import { getLocaleSlug } from 'calypso/lib/i18n-utils';
const survicateDebug = debug( 'calypso:analytics:survicate' );

let survicateScriptLoaded = false;
const workspaceId = 'e4794374cce15378101b63de24117572';

const SURVICATE_BRIDGED_EVENTS = [
	'calypso_launchpad_task_clicked',
	'calypso_customer_home_my_site_edit_homepage_click',
	'calypso_customer_home_my_site_change_theme_click',
	'calypso_customer_home_my_site_write_post_click',
];

const SURVICATE_DEFERRED_EVENTS = SURVICATE_BRIDGED_EVENTS;
const SURVICATE_PENDING_EVENTS_STORAGE_KEY = 'calypso:survicate:pending-events';
const SURVICATE_PENDING_EVENT_TTL_IN_MS = 1000 * 60 * 60 * 24;

let cachedSessionStorage;

const getSessionStorage = () => {
	if ( typeof window === 'undefined' ) {
		return undefined;
	}

	if ( cachedSessionStorage !== undefined ) {
		return cachedSessionStorage || undefined;
	}

	try {
		cachedSessionStorage = window.sessionStorage;
	} catch ( error ) {
		cachedSessionStorage = null;
		survicateDebug( 'Session storage not accessible', error );
	}

	return cachedSessionStorage || undefined;
};

const getCurrentPathSignature = () => {
	if ( typeof window === 'undefined' ) {
		return '';
	}

	return window.location.pathname || '';
};

const normalisePathSignature = ( path ) => {
	if ( typeof path !== 'string' || ! path ) {
		return '';
	}

	const queryIndex = path.indexOf( '?' );
	const hashIndex = path.indexOf( '#' );
	let endIndex = path.length;

	if ( queryIndex !== -1 ) {
		endIndex = queryIndex;
	}

	if ( hashIndex !== -1 && hashIndex < endIndex ) {
		endIndex = hashIndex;
	}

	return path.slice( 0, endIndex );
};

const pruneExpiredPendingSurvicateEvents = ( events ) => {
	const now = Date.now();

	return events.filter(
		( event ) =>
			event &&
			typeof event.eventName === 'string' &&
			typeof event.path === 'string' &&
			typeof event.timestamp === 'number' &&
			now - event.timestamp < SURVICATE_PENDING_EVENT_TTL_IN_MS
	);
};

const readPendingSurvicateEvents = () => {
	const storage = getSessionStorage();

	if ( ! storage ) {
		return [];
	}

	try {
		const raw = storage.getItem( SURVICATE_PENDING_EVENTS_STORAGE_KEY );

		if ( ! raw ) {
			return [];
		}

		const parsed = JSON.parse( raw );

		if ( Array.isArray( parsed ) ) {
			return pruneExpiredPendingSurvicateEvents( parsed );
		}
	} catch ( error ) {
		survicateDebug( 'Failed to read Survicate pending events', error );
	}

	return [];
};

const writePendingSurvicateEvents = ( events ) => {
	const storage = getSessionStorage();

	if ( ! storage ) {
		return;
	}

	try {
		if ( ! events.length ) {
			storage.removeItem( SURVICATE_PENDING_EVENTS_STORAGE_KEY );
			return;
		}

		storage.setItem( SURVICATE_PENDING_EVENTS_STORAGE_KEY, JSON.stringify( events ) );
	} catch ( error ) {
		survicateDebug( 'Failed to write Survicate pending events', error );
	}
};

const persistPendingSurvicateEvent = ( eventName, path = getCurrentPathSignature() ) => {
	const storage = getSessionStorage();

	if ( ! storage ) {
		return;
	}

	const normalisedPath = normalisePathSignature( path );

	if ( ! normalisedPath ) {
		return;
	}

	const pendingEvents = readPendingSurvicateEvents();
	const existingIndex = pendingEvents.findIndex(
		( event ) => event.eventName === eventName && event.path === normalisedPath
	);
	const timestamp = Date.now();

	if ( existingIndex > -1 ) {
		pendingEvents[ existingIndex ].timestamp = timestamp;
	} else {
		pendingEvents.push( { eventName, path: normalisedPath, timestamp } );
	}

	writePendingSurvicateEvents( pendingEvents );
};

const takePendingSurvicateEventsForPath = ( path ) => {
	const storage = getSessionStorage();

	if ( ! storage ) {
		return [];
	}

	const normalisedPath = normalisePathSignature( path );

	if ( ! normalisedPath ) {
		return [];
	}

	const pendingEvents = readPendingSurvicateEvents();

	if ( ! pendingEvents.length ) {
		return [];
	}

	const eventsForPath = [];
	const remainingEvents = [];

	pendingEvents.forEach( ( event ) => {
		if ( event.path === normalisedPath ) {
			eventsForPath.push( event );
		} else {
			remainingEvents.push( event );
		}
	} );

	if ( remainingEvents.length !== pendingEvents.length ) {
		writePendingSurvicateEvents( remainingEvents );
	}

	return eventsForPath.map( ( event ) => event.eventName );
};

const removePendingSurvicateEvent = ( eventName, path ) => {
	const storage = getSessionStorage();

	if ( ! storage ) {
		return;
	}

	const normalisedPath = normalisePathSignature( path );

	if ( ! normalisedPath ) {
		return;
	}

	const pendingEvents = readPendingSurvicateEvents();

	if ( ! pendingEvents.length ) {
		return;
	}

	const filteredEvents = pendingEvents.filter(
		( event ) => ! ( event.eventName === eventName && event.path === normalisedPath )
	);

	if ( filteredEvents.length === pendingEvents.length ) {
		return;
	}

	writePendingSurvicateEvents( filteredEvents );
};

const survicateEventQueue = [];
let isSurvicateEventListenerRegistered = false;

const isSurvicateAvailable = () => {
	if ( typeof window === 'undefined' ) {
		return false;
	}

	// eslint-disable-next-line no-undef
	return typeof _sva !== 'undefined' && typeof _sva.invokeEvent === 'function';
};

const invokeSurvicateEvent = ( eventName ) => {
	// eslint-disable-next-line no-undef
	_sva.invokeEvent( eventName );
	survicateDebug( 'Survicate event invoked: ' + eventName );
};

const flushSurvicateEventQueue = () => {
	if ( ! isSurvicateAvailable() || ! survicateEventQueue.length ) {
		return;
	}

	while ( survicateEventQueue.length ) {
		const queuedEventName = survicateEventQueue.shift();

		try {
			invokeSurvicateEvent( queuedEventName );
			removePendingSurvicateEvent( queuedEventName, getCurrentPathSignature() );
		} catch ( error ) {
			survicateDebug( 'Failed to invoke Survicate event: ' + queuedEventName, error );
			persistPendingSurvicateEvent( queuedEventName, getCurrentPathSignature() );
		}
	}
};

const queuePendingSurvicateEventsForPath = ( path ) => {
	const normalisedPath = normalisePathSignature( path );

	if ( ! normalisedPath ) {
		return;
	}

	const pendingEvents = takePendingSurvicateEventsForPath( normalisedPath );

	if ( ! pendingEvents.length ) {
		return;
	}

	pendingEvents.forEach( ( eventName ) => {
		survicateEventQueue.push( eventName );
	} );
	survicateDebug( 'Recovered Survicate events for path: ' + normalisedPath, pendingEvents );
	flushSurvicateEventQueue();
};

const handleTracksRecordEvent = ( eventName, eventProperties = {} ) => {
	if ( SURVICATE_BRIDGED_EVENTS.includes( eventName ) ) {
		const targetPathForPersistence =
			typeof eventProperties === 'object' &&
			typeof eventProperties.survicate_target_path === 'string'
				? eventProperties.survicate_target_path
				: getCurrentPathSignature();

		if ( ! mayWeLoadSurvicateScript() ) {
			survicateDebug( 'Skipping Survicate event because script is disabled', eventName );
			return;
		}

		const shouldDeferEvent = SURVICATE_DEFERRED_EVENTS.includes( eventName );

		if ( shouldDeferEvent ) {
			persistPendingSurvicateEvent( eventName, targetPathForPersistence );
			survicateDebug( 'Deferred Survicate event until matching page load: ' + eventName );
			return;
		}

		if ( isSurvicateAvailable() ) {
			try {
				invokeSurvicateEvent( eventName );
			} catch ( error ) {
				survicateDebug( 'Failed to invoke Survicate event: ' + eventName, error );
				persistPendingSurvicateEvent( eventName, targetPathForPersistence );
			}
			return;
		}

		survicateDebug( 'Queueing Survicate event until script is ready: ' + eventName );
		survicateEventQueue.push( eventName );
		persistPendingSurvicateEvent( eventName, targetPathForPersistence );
		return;
	}

	if ( eventName === 'calypso_page_view' ) {
		const targetPath =
			typeof eventProperties === 'object' &&
			typeof eventProperties.path === 'string' &&
			eventProperties.path
				? eventProperties.path
				: getCurrentPathSignature();

		queuePendingSurvicateEventsForPath( targetPath );
	}
};

const registerSurvicateEventListener = () => {
	if ( isSurvicateEventListenerRegistered || SURVICATE_BRIDGED_EVENTS.length === 0 ) {
		return;
	}

	isSurvicateEventListenerRegistered = true;
	analyticsEvents.on( 'record-event', handleTracksRecordEvent );
};
registerSurvicateEventListener();
queuePendingSurvicateEventsForPath( getCurrentPathSignature() );

/**
 * Sets Survicate visitor traits with current user data
 */
const setSurvicateVisitorTraits = () => {
	const user = getCurrentUser();

	if ( isUserOnAnonymousPaths() ) {
		survicateDebug( 'Not setting Survicate visitor traits because user is on an anonymous path' );
		return;
	}

	if ( ! user || ! user.email ) {
		survicateDebug( 'Not setting Survicate visitor traits because user is not logged in' );

		// Log error to backend for monitoring
		recordTracksEvent( 'calypso_survicate_user_not_available_error', {
			user_exists: !! user,
			user_has_email: !! ( user && user.email ),
			referrer: document.referrer || '',
			pathname: window.location.pathname || '',
			hostname: window.location.hostname || '',
		} );

		return;
	}

	// eslint-disable-next-line no-undef
	if ( typeof _sva !== 'undefined' && _sva.setVisitorTraits ) {
		// eslint-disable-next-line no-undef
		_sva.setVisitorTraits( {
			email: user.email,
		} );
		survicateDebug( 'Survicate visitor traits set with email: ' + user.email );
		flushSurvicateEventQueue();
	} else {
		survicateDebug( 'Survicate _sva object not available' );
	}
};

export function mayWeLoadSurvicateScript() {
	return config( 'survicate_enabled' );
}

/**
 * Checks if the user is on an anonymous path.
 * @returns {boolean} True if the user is on an anonymous path, false otherwise
 */
export function isUserOnAnonymousPaths() {
	return [
		'/log-in',
		'/setup/onboarding/user',
		'/log-in/lostpassword',
		'/account/user-social',
		'/log-in/link',
		'/log-in/qr',
	].includes( window.location.pathname );
}

export function addSurvicate() {
	// Only add survicate for en languages
	if ( ! getLocaleSlug().startsWith( 'en' ) ) {
		survicateDebug( 'Not loading Survicate script for non-en language' );
		return;
	}

	if ( isMobile() ) {
		survicateDebug( 'Not loading Survicate script on mobile device' );
		return;
	}

	if ( survicateScriptLoaded ) {
		setTimeout( () => {
			setSurvicateVisitorTraits();
			flushSurvicateEventQueue();
		}, 1000 );
		survicateDebug( 'Survicate script already loaded' );
		return;
	}

	if ( ! mayWeLoadSurvicateScript() ) {
		survicateDebug( 'Not loading Survicate script due to config setting' );
		return;
	}

	( function () {
		const s = document.createElement( 'script' );
		s.src = `https://survey.survicate.com/workspaces/${ workspaceId }/web_surveys.js`;
		s.async = true;

		// Wait for the script to load before setting visitor traits
		s.onload = function () {
			survicateDebug( 'Survicate script loaded' );
			setTimeout( () => {
				setSurvicateVisitorTraits();
				flushSurvicateEventQueue();
			}, 1000 );
		};

		s.onerror = function () {
			survicateDebug( 'Failed to load Survicate script' );
		};

		const e = document.getElementsByTagName( 'script' )[ 0 ];
		e.parentNode.insertBefore( s, e );
	} )();

	survicateScriptLoaded = true;
}
