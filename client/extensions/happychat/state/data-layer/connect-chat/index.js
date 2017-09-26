/**
 * External dependencies
 */
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import {
	getCurrentUser,
	getCurrentUserLocale,
} from 'state/current-user/selectors';
import { getHelpSelectedSite } from 'state/help/selectors';
import wpcom from 'lib/wp';
import {
	isHappychatConnectionUninitialized,
	getGroups,
} from 'extensions/happychat/state/selectors';
import {
	receiveChatEvent,
	requestChatTranscript,
	setConnected,
	setConnecting,
	setDisconnected,
	setHappychatAvailable,
	setHappychatChatStatus,
	setReconnecting,
	setGeoLocation,
} from 'extensions/happychat/state/actions';

const debug = debugFactory( 'calypso:extensions:happychat:state:data-layer:connect-chat' );

// Promise based interface for wpcom.request
const request = ( ... args ) => new Promise( ( resolve, reject ) => {
	wpcom.request( ... args, ( error, response ) => {
		if ( error ) {
			return reject( error );
		}
		resolve( response );
	} );
} );

const startSession = () => request( {
	method: 'POST',
	path: '/happychat/session'
} );

const sign = ( payload ) => request( {
	method: 'POST',
	path: '/jwt/sign',
	body: { payload: JSON.stringify( payload ) }
} );

const connectChat = ( connection ) => ( { getState, dispatch } ) => {
	const state = getState();
	if ( ! isHappychatConnectionUninitialized( state ) ) {
		// If chat has already initialized, do nothing
		return;
	}

	const user = getCurrentUser( state );
	const locale = getCurrentUserLocale( state );
	let groups = getGroups( state );

	// update the chat locale and groups when happychat is initialized
	const selectedSite = getHelpSelectedSite( state );
	if ( selectedSite && selectedSite.ID ) {
		groups = getGroups( state, selectedSite.ID );
	}

	// Notify that a new connection is being established
	dispatch( setConnecting() );

	debug( 'opening with chat locale', locale );

	// Before establishing a connection, set up connection handlers
	connection
		.on( 'connected', () => {
			dispatch( setConnected() );

			// TODO: There's no need to dispatch a separate action to request a transcript.
			// The HAPPYCHAT_CONNECTED action should have its own middleware handler that does this.
			dispatch( requestChatTranscript() );
		} )
		.on( 'disconnect', reason => dispatch( setDisconnected( reason ) ) )
		.on( 'reconnecting', () => dispatch( setReconnecting() ) )
		.on( 'message', event => dispatch( receiveChatEvent( event ) ) )
		.on( 'status', status => dispatch( setHappychatChatStatus( status ) ) )
		.on( 'accept', accept => dispatch( setHappychatAvailable( accept ) ) );

	// create new session id and get signed identity data for authenticating
	return startSession()
		.then( ( { session_id, geo_location } ) => {
			if ( geo_location && geo_location.country_long && geo_location.city ) {
				dispatch( setGeoLocation( geo_location ) );
			}

			return sign( { user, session_id } );
		} )
		.then( ( { jwt } ) => connection.open( user.ID, jwt, locale, groups ) )
		.catch( e => debug( 'failed to start happychat session', e, e.stack ) );
};

export default connectChat;
