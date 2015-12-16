/**
 * External dependencies
 */
import debugModule from 'debug';
import config from 'config';
import cookie from 'cookie';
import store from 'store';

/**
 * Internal dependencies
 */
import sitesModule from 'lib/sites-list';
import wpcom from 'lib/wp';
import analytics from 'analytics';
import emitter from 'lib/mixins/emitter';
import userModule from 'lib/user';
import { isBusiness, isEnterprise } from 'lib/products-values';
import olarkApi from 'lib/olark-api';
import notices from 'notices';
import olarkEvents from 'lib/olark-events';
import olarkActions from 'lib/olark-store/actions';
import i18n from 'lib/mixins/i18n';

/**
 * Module variables
 */
const debug = debugModule( 'calypso:olark' );
const sites = sitesModule();
const user = userModule();
const wpcomUndocumented = wpcom.undocumented();
const DAY_IN_SECONDS = 86400;
const DAY_IN_MILLISECONDS = DAY_IN_SECONDS * 1000;

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

		if ( config.isEnabled( 'olark_use_wpcom_configuration' ) ) {
			this.getOlarkConfiguration()
				.then( ( configuration ) => this.configureOlark( configuration ) )
				.catch( ( error ) => this.handleError( error ) );
		} else {
			this.once( 'eligible', this.configureOlark.bind( this ) );
			this.checkChatEligibility();
		}
	},

	handleError: function( error ) {
		// error.error === 'authorization_required' when the user is logged out
		// when https://github.com/Automattic/wp-calypso/issues/289 is fixed then we can remove this condition
		if ( error.error !== 'authorization_required' ) {
			notices.error( error.message );
		}
	},

	getOlarkConfiguration: function() {
		return new Promise( ( resolve, reject ) => {
			// TODO: Maybe store this configuration in local storage? The problem is that the configuration for a user could
			// change if they purchase upgrades or if their upgrades expire. There's also throttling that happens for unpaid users.
			// There is lots to consider before storing this configuration
			debug( 'Using rest api to get olark configuration' );

			wpcomUndocumented.getOlarkConfiguration( ( error, configuration ) => {
				if ( error ) {
					reject( error );
					return;
				}
				resolve( configuration );
			} );
		} );
	},

	checkChatEligibility() {
		var now = new Date().getTime(),
			data = store.get( this.eligibilityKey );

		if ( 'undefined' === typeof data ) {
			this.fetchUpgradesCache();
		} else {
			// Our cache is old, so refetch and bail.
			if ( data.lastChecked + DAY_IN_MILLISECONDS < now ) {
				this.fetchUpgradesCache();
				return;
			}

			if ( now > data.lastChecked && data.userIsEligible === true ) {
				this.emit( 'eligible' );
			}
		}
	},

	fetchUpgradesCache() {
		wpcom.req.get( { path: '/me/upgrades' }, ( error, data ) => {
			if ( error ) {
				return;
			}

			if ( ! this.hasChatEligibleUpgrade( data ) ) {
				this.storeEligibility( false );
				return;
			}

			this.storeEligibility( true );
			this.emit( 'eligible' );
		} );
	},

	storeEligibility( status ) {
		store.set( this.eligibilityKey, { userIsEligible: status, lastChecked: new Date().getTime() } );
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
			];

		olarkEvents.initialize();

		olarkEvents.once( 'api.chat.onReady', olarkActions.setReady );
		olarkEvents.on( 'api.chat.onOperatorsAway', olarkActions.setOperatorsAway );
		olarkEvents.on( 'api.chat.onOperatorsAvailable', olarkActions.setOperatorsAvailable );

		updateDetailsEvents.forEach( event => olarkEvents.on( event, olarkActions.updateDetails ) );

		olarkEvents.on( 'api.chat.onCommandFromOperator', ( event ) => {
			if ( event.command.name === 'end' ) {
				const { email } = user.get();
				olarkActions.sendNotificationToVisitor( i18n.translate(
					"Your live chat has ended. We'll send a transcript to %(email)s.",
					{ args: { email } }
				) );
			}
		} );

		debug( 'Olark code loaded, beginning configuration' );

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

		olarkApi( 'api.chat.onOperatorsAway', function() {
			olarkApi( 'api.chat.sendNotificationToVisitor', { body: i18n.translate( "Oops, our operators have all stepped away for a moment. If you don't hear back from us shortly, please try again later. Thanks!" ) } );
		} );

		store.set( this.operatorsAvailableKey, true );
	},

	bindOnOperatorsAvailableEvent() {
		this.operatorAvailable = true;

		if ( true !== store.get( this.operatorsAvailableKey ) || false === this.conversationStarted ) {
			return;
		}

		olarkApi( 'api.chat.onOperatorsAvailable', function() {
			olarkApi( 'api.chat.sendNotificationToVisitor', { body: i18n.translate( "Hey, we're back. If you don't hear from us shortly, please try your question once more. Thanks!" ) } );
		} );

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
	},

	hasChatEligibleUpgrade( upgrades ) {
		return upgrades && upgrades.some( ( upgrade ) => {
			var userType;

			if ( isBusiness( upgrade ) ) {
				userType = 'Business';
			}

			if ( isEnterprise( upgrade ) ) {
				userType = 'ENTERPRISE';
			}

			if ( ! userType ) {
				return false;
			}

			this.userType = userType;
			return true;
		} );
	}
};

emitter( olark );
olark.initialize();
