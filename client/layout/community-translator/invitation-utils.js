/**
 * Community Translator Invitation Module
 */

/**
 * External dependencies
 */
import Debug from 'debug';
import includes from 'lodash/includes';
import store from 'store';
import once from 'lodash/once';

/**
 * Internal dependencies
 */
import translator from 'lib/translator-jumpstart';
import userFactory from 'lib/user';
import userSettings from 'lib/user-settings';
import emitter from 'lib/mixins/emitter';
import preferencesStore from 'lib/preferences/store';
import preferencesActions from 'lib/preferences/actions';
import notices from 'notices';
import analytics from 'lib/analytics';

const debug = Debug( 'calypso:community-translator-invitation' ),
	user = userFactory(),
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
let invitationPending = store.get( 'calypsoTranslatorInvitationIsPending' );

function maybeInvite() {
	const preferences = preferencesStore.getAll(),
		locale = user.get().localeSlug;

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

	// We had to wait for multiple async to get to this point, and we're above
	// most of the content, so we'll show the invitation on next load to avoid
	// an ugly visual jump
	debug( 'Translator invitation queued up for next load' );
	analytics.tracks.recordEvent( 'calypso_community_translator_invitation_queued', analyticsProperties() );
	store.set( 'calypsoTranslatorInvitationIsPending', true );
}

const invitationUtils = {
	isPending: function() {
		return invitationPending;
	},

	// The calypso editor is styled flush to the top, and makes the invitation
	// look bad, so don't show it there
	isValidSection: function( section ) {
		return section !== 'post';
	},

	dismiss: function() {
		debug( 'dismissed' );
		permanentlyDisableInvitation();
		analytics.tracks.recordEvent( 'calypso_community_translator_invitation_dismissed', analyticsProperties() );
	},

	activate: function() {
		debug( 'activated' );
		analytics.tracks.recordEvent( 'calypso_community_translator_invitation_accepted', analyticsProperties() );
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
		analytics.tracks.recordEvent( 'calypso_community_translator_invitation_docsLink', analyticsProperties() );
	},
	recordInvitationDisplayed: once( function() {
		debug( 'displayed' );
		analytics.tracks.recordEvent( 'calypso_community_translator_invitation_displayed', analyticsProperties() );
	} )
};

emitter( invitationUtils );

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
	};
}

/*
 * Check for and/or kick off the data we need.  Each source might require a
 * call to the REST api, but we can resolve immediately if it's in localStorage
 * and already available.
 */
const userPromise = new Promise( function( resolve ) {
	user.get() ? resolve() : user.once( 'change', resolve );
} );

const userSettingsPromise = new Promise( function( resolve ) {
	if ( userSettings.hasSettings() ) {
		return resolve();
	}

	userSettings.once( 'change', resolve );
	userSettings.fetchSettings();
} );

const preferencesPromise = new Promise( function( resolve ) {
	if ( preferencesStore.getAll() ) {
		return resolve();
	}

	preferencesStore.once( 'change', resolve );
	preferencesActions.fetch();
} );

const invitePromise = Promise.all( [ userPromise, userSettingsPromise, preferencesPromise ] );
invitePromise.then( function() {
	maybeInvite();
} );

module.exports = invitationUtils;
