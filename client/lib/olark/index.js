/**
 * External dependencies
 */
import debugModule from 'debug';
import config from 'config';
import cookie from 'cookie';
import store from 'store';
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import sitesModule from 'lib/sites-list';
import wpcom from 'lib/wp';
import analytics from 'lib/analytics';
import emitter from 'lib/mixins/emitter';
import userModule from 'lib/user';
import olarkApi from 'lib/olark-api';
import notices from 'notices';
import olarkEvents from 'lib/olark-events';
import olarkStore from 'lib/olark-store';
import olarkActions from 'lib/olark-store/actions';

/**
 * Module variables
 */
const debug = debugModule( 'calypso:olark' );
const sites = sitesModule();
const user = userModule();
const wpcomUndocumented = wpcom.undocumented();
const DAY_IN_SECONDS = 86400;

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

	initialize() {
		debug( 'Initializing Olark Live Chat' );

		this.getOlarkConfiguration()
			.then( ( configuration ) => this.configureOlark( configuration ) )
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

	configureOlark: function( wpcomOlarkConfig = {} ) {
		var userData = user.get(),
			siteUrl = this.getSiteUrl(),
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
		olarkEvents.on( 'api.chat.onOperatorsAway', olarkActions.setOperatorsAway );
		olarkEvents.on( 'api.chat.onOperatorsAvailable', olarkActions.setOperatorsAvailable );

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
		this.updateLivechatActiveCookie();
		this.bindBeginConversationEvent( userData, siteUrl );

		if ( config.isEnabled( 'help' ) ) {
			// Only show the chatbox when a user is having a conversation. Chat will now be initiated only from the help/contact page
			olarkApi( 'api.visitor.getDetails', ( details ) => details.isConversing ? this.showChatBox() : olarkActions.hideBox() );
		} else {
			this.showChatBox();
		}
	},

	updateOlarkGroupAndEligibility() {
		this.getOlarkConfiguration()
			.then( ( configuration ) => {
				const isUserEligible = ( 'undefined' === typeof configuration.isUserEligible ) ? true : configuration.isUserEligible;
				olarkApi( 'api.chat.setOperatorGroup', { group: configuration.group } );
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
		const identity = wpcomOlarkConfig.identity || config( 'olark' ).business_account_id;
		const isUserEligible = ( 'undefined' === typeof wpcomOlarkConfig.isUserEligible ) ? true : wpcomOlarkConfig.isUserEligible;
		const visitorNickname = wpcomOlarkConfig.nickname || ( userData.username + ' | ' + this.userType );

		if ( false !== group ) {
			olarkApi.configure( 'system.group', group );
		}

		debug( 'Nickname: ' + visitorNickname );
		debug( 'Group: ' + group );

		olarkApi.configure( 'system.chat_does_not_follow_external_links', true );
		olarkApi.configure( 'system.mask_credit_cards', true );

		olarkActions.setUserEligibility( isUserEligible );

		if ( wpcomOlarkConfig.locale ) {
			olarkActions.setLocale( wpcomOlarkConfig.locale );
		}

		// NOTE: According to the olark api documentation, "configure" api calls are supposed to go before the "identify" api call.
		// See: https://www.olark.com/api
		olarkApi.identify( identity );

		olarkApi( 'api.chat.updateVisitorNickname', { snippet: visitorNickname } );
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

	getSiteUrl() {
		const primarySite = sites.initialized && sites.getPrimary();
		const selectedSite = sites.getSelectedSite();
		if ( selectedSite ) {
			return selectedSite.URL;
		}

		// No need to translate this since this is text seen by an HE in the olark console.
		return primarySite ? primarySite.URL : 'None found. Please check user RC.';
	},

	sendVisitorDataToOperator( userData, siteUrl ) {
		const visitorData = [
			'WordPress User Info',
			'Username: ' + userData.username + ' : ' + userData.display_name,
			'User email: ' + userData.email,
			'User ID: ' + userData.ID,
			'Site: ' + siteUrl,
			'Network Admin: https://wordpress.com/wp-admin/network/users.php?submit=Search+Users&s=' + userData.username,
			'Upgrades and Transactions : https://wordpress.com/wp-admin/network/wpcom-paid-upgrades.php?action=search&username=' + userData.username
		];

		visitorData.forEach( function( message ) {
			olarkApi( 'api.chat.updateVisitorStatus', message );
			olarkApi( 'api.chat.sendNotificationToOperator', { body: message } );
		} );
	},

	updateCustomFields( userData, siteUrl ) {
		olarkApi( 'api.visitor.updateCustomFields', {
			wpcom_id: userData.ID,
			wpcom_olark_api_id: this.apiId,
			from_page: 'calypso',
			site_url: siteUrl
		} );
	},

	bindBeginConversationEvent( userData, siteUrl ) {
		this.conversationStarted = true;
		olarkApi( 'api.chat.onBeginConversation', () => {
			this.setLivechatActiveCookie();
			this.updateCustomFields( userData, siteUrl );
			this.sendVisitorDataToOperator( userData, siteUrl );
			this.bindOnOperatorsAwayEvent();
			this.bindOnOperatorsAvailableEvent();
			this.bindOnMessageToVisitor();
			this.bindOnMessageToOperator();
			this.bindCommandFromOperator();

			analytics.mc.bumpStat( {
				olark_chat: 'live_support-begin',
				olark_chat_begin_source: 'live_support-calypso'
			} );
		} );
	},

	bindCommandFromOperator() {
		olarkApi( 'api.chat.onCommandFromOperator', function( event ) {
			if ( event.command.name === 'ticket' ) {
				olarkApi( 'api.visitor.updateCustomFields', { create_support_ticket: true } );
			}
		} );
	},

	bindOnOperatorsAwayEvent() {
		this.operatorAvailable = false;

		if ( ! this.conversationStarted ) {
			return;
		}

		store.set( this.operatorsAvailableKey, true );
	},

	bindOnOperatorsAvailableEvent() {
		this.operatorAvailable = true;

		if ( true !== store.get( this.operatorsAvailableKey ) || false === this.conversationStarted ) {
			return;
		}

		store.set( this.operatorsAvailableKey, false );
	},

	bindOnMessageToVisitor() {
		olarkApi( 'api.chat.onMessageToVisitor', this.setLivechatActiveCookie );
	},

	bindOnMessageToOperator() {
		olarkApi( 'api.chat.onMessageToOperator', this.setLivechatActiveCookie );
	},

	showChatBox() {
		olarkApi( 'api.box.show' );
		analytics.mc.bumpStat( {
			olark_chat: 'live_support-display',
			olark_chat_display_source: 'live_support-calypso'
		} );
		/**
		 * TODO: Set up tracking using Nosara
		 */
	},

	setLivechatActiveCookie() {
		const cookieOptions = {
			maxAge: DAY_IN_SECONDS,
			path: '/',
			domain: '.wordpress.com'
		};
		document.cookie = cookie.serialize( 'wpcom-livechat-active', 'yes', cookieOptions );

		debug( 'set wpcom-livechat-active cookie' );
	},

	deleteLivechatActiveCookie() {
		const cookieOptions = {
			maxAge: -1, // Expire the cookie
			path: '/',
			domain: '.wordpress.com'
		};
		document.cookie = cookie.serialize( 'wpcom-livechat-active', '', cookieOptions );

		debug( 'deleted wpcom-livechat-active cookie' );
	},

	isLivechatActiveCookieSet() {
		const cookies = cookie.parse( document.cookie );
		return typeof cookies[ 'wpcom-livechat-active' ] === 'string';
	},

	updateLivechatActiveCookie() {
		debug( 'updating wpcom-livechat-active cookie' );

		olarkApi( 'api.chat.onReady', () => { //This function will always run when called if the olark API is ready (It's not a single fire event).
			olarkApi( 'api.visitor.getDetails', ( details ) => {
				if ( details.isConversing ) {
					// Only set the cookie if it's not already set. We don't wish to change the expiration
					if ( ! this.isLivechatActiveCookieSet() ) {
						this.setLivechatActiveCookie();
					}
				} else {
					// Delete the cookie if a conversation is not active
					this.deleteLivechatActiveCookie();
				}
			} );
		} );
	}
};

emitter( olark );
olark.initialize();
module.exports = olark;
