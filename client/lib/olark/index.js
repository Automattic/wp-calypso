/**
 * External dependencies
 */
import debugModule from 'debug';
import config from 'config';
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import emitter from 'lib/mixins/emitter';
import userModule from 'lib/user';
import notices from 'notices';
import olarkEvents from 'lib/olark-events';
import olarkStore from 'lib/olark-store';
import olarkActions from 'lib/olark-store/actions';
import {
	olarkReady,
	operatorsAway,
	operatorsAvailable,
	setChatAvailability,
} from 'state/ui/olark/actions';

/**
 * Module variables
 */
const debug = debugModule( 'calypso:olark' );
const user = userModule();
const wpcomUndocumented = wpcom.undocumented();

/**
 * Loads the Olark store so that it can start receiving actions
 * This is necessary here to capture events that occur in the Olark
 * module before the React tree gets drawn.
 */
require( 'lib/olark-store' );

const olark = {

	apiId: 1,

	eligibilityKey: 'SupportChat',

	operatorsAvailableKey: 'OlarkOperatorsAvailable',

	conversationStarted: false,

	operatorAvailable: false,

	userType: 'Unknown',

	initialize( dispatch ) {
		debug( 'Initializing Olark Live Chat' );

		this.getOlarkConfiguration()
			.then( ( configuration ) => this.configureOlark( configuration, dispatch ) )
			.catch( ( error ) => this.handleError( error ) );
	},

	handleError: function( error ) {
		// Hides notices for authorization errors as they should be legitimate (e.g. we use this error code to check
		// whether the user is logged in when fetching the user profile)
		if ( error && error.message && error.error !== 'authorization_required' ) {
			notices.error( error.message );
		}
	},

	getOlarkConfiguration: function() {
		return new Promise( ( resolve, reject ) => {
			// TODO: Maybe store this configuration in local storage? The problem is that the configuration for a user could
			// change if they purchase upgrades or if their upgrades expire. There's also throttling that happens for unpaid users.
			// There is lots to consider before storing this configuration
			debug( 'Using rest api to get olark configuration' );
			const clientSlug = config( 'client_slug' );

			wpcomUndocumented.getOlarkConfiguration( clientSlug, ( error, configuration ) => {
				if ( error ) {
					reject( error );
					return;
				}
				resolve( configuration );
			} );
		} );
	},

	configureOlark: function( wpcomOlarkConfig = {}, dispatch ) {
		var userData = user.get(),
			updateDetailsEvents = [
				'api.chat.onReady',
				'api.chat.onOperatorsAway',
				'api.chat.onOperatorsAvailable',
				'api.chat.onBeginConversation',
				'api.chat.onMessageToVisitor',
				'api.chat.onMessageToOperator',
				'api.chat.onCommandFromOperator'
			],
			olarkExpandedEvents = [
				'api.box.onShow',
				'api.box.onExpand',
				'api.box.onHide',
				'api.box.onShrink',
				'api.chat.onMessageToVisitor'
			],
			updateFormattingEvents = [
				'api.chat.onReady',
				'api.chat.onBeginConversation',
				'api.chat.onMessageToVisitor',
				'api.chat.onMessageToOperator',
				'api.chat.onCommandFromOperator',
				'api.chat.onOfflineMessageToOperator'
			];

		olarkEvents.initialize();

		olarkEvents.once( 'api.chat.onReady', olarkActions.setReady );
		olarkEvents.once( 'api.chat.onReady', () => dispatch( olarkReady() ) );
		olarkEvents.on( 'api.chat.onOperatorsAway', olarkActions.setOperatorsAway );
		olarkEvents.on( 'api.chat.onOperatorsAway', () => dispatch( operatorsAway() ) );
		olarkEvents.on( 'api.chat.onOperatorsAvailable', olarkActions.setOperatorsAvailable );
		olarkEvents.on( 'api.chat.onOperatorsAvailable', () => dispatch( operatorsAvailable() ) );

		olarkExpandedEvents.forEach( this.hookExpansionEventToStoreSync.bind( this ) );

		updateDetailsEvents.forEach( eventName => olarkEvents.on( eventName, olarkActions.updateDetails ) );

		updateFormattingEvents.forEach( eventName => olarkEvents.on( eventName, () => {
			// Using setTimeout here so that we can call updateOlarkFormatting on the next tick, after the event has fired and all event handlers are processed.
			setTimeout( () => this.updateOlarkFormatting( userData.display_name, userData.avatar_URL ), 0 );
		} ) );

		debug( 'Olark code loaded, beginning configuration' );

		olarkEvents.on( 'api.chat.onCommandFromOperator', ( event ) => {
			if ( event.command.name === 'end' ) {
				olarkActions.sendNotificationToVisitor( i18n.translate(
					"Your live chat has ended. We'll send a transcript to %(email)s.",
					{ args: { email: userData.email } }
				) );
			}
		} );

		this.setOlarkOptions( userData, wpcomOlarkConfig );

		dispatch( setChatAvailability( wpcomOlarkConfig.availability ) );
	},

	updateOlarkGroupAndEligibility() {
		this.getOlarkConfiguration()
			.then( ( configuration ) => {
				const isUserEligible = ( 'undefined' === typeof configuration.isUserEligible ) ? true : configuration.isUserEligible;
				olarkActions.setUserEligibility( isUserEligible );
			} )
			.catch( ( error ) => this.handleError( error ) );
	},

	syncStoreWithExpandedState() {
		// We query the dom here because there is no other 100% accurate way to figure this out. Olark does not
		// provide initial events for api.box.onExpand when the api.box.show event is fired.
		const isOlarkExpanded = !! document.querySelector( '.olrk-state-expanded' );
		if ( isOlarkExpanded !== olarkStore.get().isOlarkExpanded ) {
			olarkActions.setExpanded( isOlarkExpanded );
		}
	},

	hookExpansionEventToStoreSync( eventName ) {
		olarkEvents.on( eventName, this.syncStoreWithExpandedState );
	},

	setOlarkOptions( userData, wpcomOlarkConfig = {} ) {
		const group = wpcomOlarkConfig.group || config( 'olark' ).business_group_id;
		const isUserEligible = ( 'undefined' === typeof wpcomOlarkConfig.isUserEligible ) ? true : wpcomOlarkConfig.isUserEligible;
		const visitorNickname = wpcomOlarkConfig.nickname || ( userData.username + ' | ' + this.userType );

		debug( 'Nickname: ' + visitorNickname );
		debug( 'Group: ' + group );

		olarkActions.setUserEligibility( isUserEligible );
		olarkActions.setClosed( wpcomOlarkConfig.isClosed );

		if ( wpcomOlarkConfig.locale ) {
			olarkActions.setLocale( wpcomOlarkConfig.locale );
		}
	},

	updateOlarkFormatting( username, avatarURL ) {
		var allNameNodes = document.querySelectorAll( '.hbl_pal_local_fg, .hbl_pal_remote_fg:not(.habla_conversation_notification_nickname)' ),
			olarkAvatars = document.querySelectorAll( '.olrk_avatar' ),
			olarkAvatarMap = {},
			defaultAvatarURL = '//gravatar.com/avatar?s=32&d=identicon&r=PG',
			translatedStaffLabel = i18n.translate( 'staff' ),
			personClassName, previousPersonClassName, gravatar, staffLabel,
			avatarNodeIndex, avatarNode, staffNameNode, nameNodeContent,
			nameNodeIndex, nameNode, isUserResponse;

		// Generate a mapping for avatar to staff members
		for ( avatarNodeIndex = 0; avatarNodeIndex < olarkAvatars.length; avatarNodeIndex++ ) {
			avatarNode = olarkAvatars.item( avatarNodeIndex );
			staffNameNode = avatarNode.parentElement.querySelector( '.hbl_pal_remote_fg' );

			if ( ! staffNameNode ) {
				continue;
			}

			olarkAvatarMap[ staffNameNode.originalTextContent || staffNameNode.textContent ] = avatarNode.getAttribute( 'src' );
		}

		for ( nameNodeIndex = 0; nameNodeIndex < allNameNodes.length; nameNodeIndex++ ) {
			nameNode = allNameNodes.item( nameNodeIndex );
			personClassName = nameNode.className.replace( /.*(habla_conversation_person\d+).*/, '$1' );
			isUserResponse = !! nameNode.className.match( /hbl_pal_local_fg/ );
			nameNodeContent = nameNode.textContent;

			if ( previousPersonClassName === personClassName ) {
				// Remove successive name labels so that they dont repeat
				nameNode.parentElement.removeChild( nameNode );
				continue;
			}

			if ( isUserResponse ) {
				// Clear out the arrow and put the users name
				nameNode.textContent = username;
			} else if ( ! nameNode.querySelector( '.staff-label' ) ) {
				// Keep a reference to the old text content before we change it
				// because we use it to match up the avatars
				nameNode.originalTextContent = nameNode.textContent;

				// Add the staff label
				nameNode.textContent = nameNode.textContent.replace( ':', '' );
				staffLabel = document.createElement( 'span' );
				staffLabel.setAttribute( 'class', 'staff-label' );
				staffLabel.appendChild( document.createTextNode( translatedStaffLabel ) );

				nameNode.appendChild( staffLabel );
			}

			if ( ! nameNode.querySelector( '.gravatar' ) ) {
				// Inject the gravatar
				gravatar = document.createElement( 'img' );
				gravatar.setAttribute( 'class', 'gravatar' );

				if ( isUserResponse ) {
					gravatar.setAttribute( 'src', avatarURL );
				} else {
					gravatar.setAttribute( 'src', olarkAvatarMap[ nameNodeContent ] || defaultAvatarURL );
				}

				nameNode.insertBefore( gravatar, nameNode.firstChild );
			}

			previousPersonClassName = personClassName;
		};
	},
};

emitter( olark );

module.exports = olark;
