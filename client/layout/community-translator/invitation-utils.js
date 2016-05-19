/**
 * Community Translator Invitation Module
 */

/**
 * External dependencies
 */
var debug = require( 'debug' )( 'calypso:community-translator-invitation' ),
	includes = require( 'lodash/includes' ),
	store = require( 'store' ),
	once = require( 'lodash/once'),
	translate = require( 'i18n-calypso' ).translate;

/**
 * Internal dependencies
 */
var translator = require( 'lib/translator-jumpstart' ),
	user = require( 'lib/user' )(),
	userSettings = require( 'lib/user-settings' ),
	emitter = require( 'lib/mixins/emitter' ),
	preferencesStore = require( 'lib/preferences/store' ),
	preferencesActions = require( 'lib/preferences/actions' ),
	notices = require( 'notices' ),
	abModule = require( 'lib/abtest' ),
	tracks = require( 'lib/analytics' ).tracks;

var invitationUtils, userPromise, userSettingsPromise, preferencesPromise,
	invitePromise,
	invitationPending = store.get( 'calypsoTranslatorInvitationIsPending' ),
	inclusionPercent = 10,
	excludedLocales = [
		'en',
		'es',
		'pt-br',
		'de',
		'fr',
		'he',
		'ja',
		'it',
		'nl',
		'ru',
		'tr',
		'id',
		'zh-cn',
		'zh-tw',
		'ko',
		'ar',
		'sv'
	];

// Temporary clean up
// This shipped without the 'en' check, and users that visited while that was
// live could have pending invitations.
// We should reomve this line after, say, two weeks - November 12th 2015
store.remove( 'calypsoTranslatorInvitationPending' );

function maybeInvite() {
	var preferences = preferencesStore.getAll(),
		locale = user.get().localeSlug,
		abBucket;

	debug( 'Checking if we should show invitation notice' );

	if ( preferences.translatorInvited ) {
		debug( 'Not inviting, already invited' );
		return;
	}

	if ( translator.isEnabled() ) {
		debug( 'Not inviting, user already knows about the translator' );
		permanentlyDisableInvitation();
		return;
	}

	if ( ! translator.isValidBrowser() ) {
		debug( 'Not inviting, browser missing features' );
		return;
	}

	if ( includes( excludedLocales, locale ) ) {
		debug( 'Not inviting because of user locale', locale );
		return;
	}

	if ( inclusionPercent < user.get().ID % 100 ) {
		debug( `Not inviting, user ${user.get().ID} is not part of test cohort (${inclusionPercent}%)` );
		return;
	}

	abBucket = abModule.abtest( 'translatorInvitation' );
	debug( `user was allocated to abtest: ${abBucket} ` );
	if ( abBucket === 'noNotice' ) {
		debug( 'Not inviting, user part of control group' );
		return;
	}

	// We had to wait for multiple async to get to this point, and we're above
	// most of the content, so we'll show the invitation on next load to avoid
	// an ugly visual jump
	debug( 'Translator invitation queued up for next load' );
	tracks.recordEvent( 'calypso_community_translator_invitation_queued', analyticsProperties() );
	store.set( 'calypsoTranslatorInvitationIsPending', true );
}

function permanentlyDisableInvitation() {
	debug( 'disabling' );
	preferencesActions.set( 'translatorInvited', true );
	invitationPending = false;
	invitationUtils.emitChange();
	store.remove( 'calypsoTranslatorInvitationIsPending' );
}

function analyticsProperties() {
	return {
		locale: user.data.localeSlug,
		abtest_variation: abModule.getABTestVariation( 'translatorInvitation' )
	};
}

invitationUtils = {
	isPending: function() {
		return invitationPending;
	},

	// The calypso editor is styled flush to the top, and makes the invitation
	// look bad, so don't show it there
	isValidSection: function( section ) {
		return section !== 'post';
	},

	// Provide variant-driven overides for ./invitation-component.jsx
	subComponentVariations: function() {
		// see client/abtest/active-tests.js and for relevant fields
		var result;
		switch ( abModule.getABTestVariation( 'translatorInvitation' ) ) {
			case 'tryItNow':
				result = { acceptButtonText: translate( 'Try it now!' ) };
				break;
			case 'startTranslating':
				result = { acceptButtonText: translate( 'Start Translating' ) };
				break;
			case 'helpUs':
				result = { title: translate( 'Help us translate WordPress.com' ) };
				break;
			case 'improve':
				result = { title: translate( 'Translate and improve WordPress.com in your language.' ) };
				break;
			case 'startNow': // fallthrough
			default:
				result = {};
		}
		return result;
	},

	dismiss: function() {
		debug( 'dismissed' );
		permanentlyDisableInvitation();
		tracks.recordEvent( 'calypso_community_translator_invitation_dismissed', analyticsProperties() );
	},

	activate: function() {
		debug( 'activated' );
		tracks.recordEvent( 'calypso_community_translator_invitation_accepted', analyticsProperties() );
		userSettings.saveSettings( function( error, response ) {
			if ( error || ! response || ! response.enable_translator ) {
				debug( 'Error saving settings: ' + JSON.stringify( error ), 'response:', response );
				notices.error( 'There was a problem enabling the Community Translator' );
				return;
			}
			translator.toggle();
			permanentlyDisableInvitation();
		}, { enable_translator: true }
		);
	},
	recordDocsEvent: function() {
		debug( 'docs' );
		tracks.recordEvent( 'calypso_community_translator_invitation_docsLink', analyticsProperties() );
	},
	recordInvitationDisplayed: once( function() {
		debug( 'displayed' );
		tracks.recordEvent( 'calypso_community_translator_invitation_displayed', analyticsProperties() );
	} )
};

emitter( invitationUtils );

/*
 * Check for and/or kick off the data we need.  Each source might require a
 * call to the REST api, but we can resolve immediately if it's in localStorage
 * and already available.
 */
userPromise = new Promise( function( resolve ) {
	user.get() ? resolve() : user.once( 'change', resolve );
} );

userSettingsPromise = new Promise( function( resolve ) {
	if ( userSettings.hasSettings() ) {
		return resolve();
	}

	userSettings.once( 'change', resolve );
	userSettings.fetchSettings();
} );

preferencesPromise = new Promise( function( resolve ) {
	if ( preferencesStore.getAll() ) {
		return resolve();
	}

	preferencesStore.once( 'change', resolve );
	preferencesActions.fetch();
} );

invitePromise = Promise.all( [ userPromise, userSettingsPromise, preferencesPromise ] );
invitePromise.then( function() {
	maybeInvite();
} );

module.exports = invitationUtils;
