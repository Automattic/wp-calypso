/** @format */

/**
 * External dependencies
 */

import debugModule from 'debug';
import React from 'react';
import i18n from 'i18n-calypso';
import { find, isEmpty } from 'lodash';

/**
 * Internal dependencies
 */
import config from 'config';
import User from 'lib/user';
import userSettings from 'lib/user-settings';
import { isMobile } from 'lib/viewport';
import analytics from 'lib/analytics';
import Translatable from 'components/translatable';

/**
 * Local variables
 */
const debug = debugModule( 'calypso:community-translator' );
const languages = config( 'languages' );
const user = new User();

// TODO: rename parent dir to translate and this file to index.js (update README)
class Translator {
	static instance;

	languageJson = null;
	currentLocale = null;
	shouldWrapTranslations = false;
	initialized = false;
	previousUserSettingsEnabledValue = null;

	constructor() {
		if ( this.instance ) {
			return this.instance;
		}
		this.instance = this;

		// wrap translations from i18n
		i18n.registerTranslateHook( ( translation, options ) =>
			this.wrapTranslation( options.original, translation, options )
		);

		// callback when translated component changes.
		// the callback is overwritten by the translator on load/unload, so we're returning it within an anonymous function.
		i18n.registerComponentUpdateHook( () => {} );
		i18n.on( 'change', this.refresh );
		user.on( 'change', this.refresh );
		userSettings.on( 'change', this.trackTranslatorStatus );
		userSettings.on( 'change', this.refresh );
	}

	refresh = () => {
		this.languageJson = i18n.getLocale() || { '': {} };
		const localeCode = this.languageJson[ '' ].localeSlug;
		this.currentLocale = find( languages, lang => lang.langSlug === localeCode );

		if ( ! localeCode || ! this.languageJson ) {
			debug( 'trying to initialize translator without loaded language' );
			return;
		}

		if ( this.initialized ) {
			return;
		}

		if ( ! userSettings.getSettings() ) {
			debug( 'initialization failed because userSettings are not ready' );
			return;
		}

		if ( ! this.isEnabled() ) {
			debug( 'not initializing, not enabled' );
			return;
		}

		debug( 'Successfully initialized' );
		this.initialized = true;
	};

	/**
	 * TODO: expand jsdoc comment
	 * "Activated" means that the translator is toggled on, and wrapTranslate()
	 *     will add the data tags that the translator needs.
	 *
	 * @returns {Boolean}
	 */
	isActivated = () => this.shouldWrapTranslations;

	/**
	 * TODO: expand jsdoc comment
	 * "Enabled" means that the user has opted in on the settings page
	 *     ( but it's false until userSettings has loaded)
	 *
	 * @returns {Boolean}
	 */
	isEnabled() {
		const currentUser = user.get();

		if ( ! currentUser || 'en' === currentUser.localeSlug || ! currentUser.localeSlug ) {
			return false;
		}

		if ( ! userSettings.getSettings() ) {
			return false;
		}

		if ( ! userSettings.getOriginalSetting( 'enable_translator' ) ) {
			return false;
		}

		// restrict mobile devices from translator for now while we refine touch interactions
		if ( isMobile() ) {
			return false;
		}

		return true;
	}

	/**
	 * TODO: expand jsdoc comment
	 *
	 * @returns {Boolean}
	 */
	toggle() {
		if ( ! this.isActivated() ) {
			// Wrap DOM elements and then activate the translator
			this.shouldWrapTranslations = true;
			debug( 'Translator activated' );
		} else {
			this.shouldWrapTranslations = false;
			debug( 'Translator deactivated' );
		}

		i18n.reRenderTranslations();
	}

	/**
	 * TODO: expand jsdoc comment
	 *
	 * @returns {String|Object}
	 */
	wrapTranslation( originalFromPage, displayedTranslationFromPage, optionsFromPage ) {
		if ( ! this.isEnabled() || ! this.isActivated() ) {
			return displayedTranslationFromPage;
		}

		if ( 'object' !== typeof optionsFromPage ) {
			optionsFromPage = {};
		}

		if ( 'string' !== typeof originalFromPage ) {
			debug( 'unknown original format' );
			return displayedTranslationFromPage;
		}

		if ( optionsFromPage.translatable === false ) {
			debug( `author defined ${ displayedTranslationFromPage } as not translatable.` );
			return displayedTranslationFromPage;
		}

		const props = {
			singular: originalFromPage,
			locale: this.currentLocale,
		};

		// Has Context
		if ( 'string' === typeof optionsFromPage.context ) {
			props.context = optionsFromPage.context;
		}

		// Has Plural
		if ( 'string' === typeof optionsFromPage.plural ) {
			props.plural = optionsFromPage.plural;
		}

		// Has no translation in current locale
		if ( isEmpty( this.languageJson[ originalFromPage ] ) ) {
			props.untranslated = 'true';
		}

		// <data> returns a frozen object, therefore we make a copy so that we can modify it below
		const dataElement = Object.assign(
			{},
			<Translatable { ...props }>{ displayedTranslationFromPage }</Translatable>
		);

		// now we can override the toString function which would otherwise return [object Object]
		dataElement.toString = () => displayedTranslationFromPage;

		// freeze the object again to certify the same behavior as the original ReactElement object
		Object.freeze( dataElement );

		return dataElement;
	}

	/**
	 * TODO: expand jsdoc comment
	 *
	 * @returns {Boolean}
	 */
	trackTranslatorStatus = () => {
		const newSetting = userSettings.getOriginalSetting( 'enable_translator' );
		const changed = this.previousUserSettingsEnabledValue !== newSetting;
		const tracksEvent = newSetting
			? 'calypso_community_translator_enabled'
			: 'calypso_community_translator_disabled';

		if ( changed && this.previousUserSettingsEnabledValue !== undefined ) {
			debug( tracksEvent );
			analytics.tracks.recordEvent( tracksEvent, { locale: user.data.localeSlug } );
		}

		this.previousUserSettingsEnabledValue = newSetting;
	};
}

const TranslatorInstance = new Translator();

export default TranslatorInstance;
