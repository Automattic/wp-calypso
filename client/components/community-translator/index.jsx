/** @format */
/**
 * External dependencies
 */
//import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import i18n, { localize } from 'i18n-calypso';
import debugModule from 'debug';
import { find, isEmpty } from 'lodash';
/**
 * Internal dependencies
 */
import Translatable from './translatable';
import config from 'config';
import User from 'lib/user';
import userSettings from 'lib/user-settings';
import analytics from 'lib/analytics';
import { isCommunityTranslatorEnabled } from 'components/community-translator/utils';

/**
 * Local variables
 */
const debug = debugModule( 'calypso:community-translator' );
const languages = config( 'languages' );
const user = new User();

class CommunityTranslator extends Component {

	languageJson = null;
	currentLocale = null;
	initialized = false;
	previousUserSettingsEnabledValue = null;

	componentDidMount() {
		this.setLanguage();

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

	componentWillUnmount() {
		i18n.off( 'change', this.refresh );
		user.removeListener( 'change', this.refresh );
		userSettings.removeListener( 'change', this.trackTranslatorStatus );
		userSettings.removeListener( 'change', this.refresh );
	}

	setLanguage() {
		this.languageJson = i18n.getLocale() || { '': {} };
		this.localeCode = this.languageJson[ '' ].localeSlug;
		this.currentLocale = find( languages, lang => lang.langSlug === this.localeCode );
	}

	/**
	 * TODO: expand jsdoc comment
	 *
	 */
	refresh = () => {
		if ( this.initialized ) {
			return;
		}

		if ( ! userSettings.getSettings() ) {
			debug( 'initialization failed because userSettings are not ready' );
			return;
		}

		if ( ! isCommunityTranslatorEnabled() ) {
			debug( 'not initializing, not enabled' );
			return;
		}

		this.setLanguage();

		if ( ! this.localeCode || ! this.languageJson ) {
			debug( 'trying to initialize translator without loaded language' );
			return;
		}

		debug( 'Successfully initialized' );
		this.initialized = true;
	};

	/**
	 * TODO: expand jsdoc comment
	 *
	 * @returns {String|Object}
	 */
	wrapTranslation( originalFromPage, displayedTranslationFromPage, optionsFromPage ) {
		if ( ! isCommunityTranslatorEnabled() ) {
			return displayedTranslationFromPage;
		}

		if ( 'object' !== typeof optionsFromPage ) {
			optionsFromPage = {};
		}

		if ( 'string' !== typeof originalFromPage ) {
			debug( 'unknown original format' );
			return displayedTranslationFromPage;
		}

		if ( 'boolean' === typeof optionsFromPage.textOnly && optionsFromPage.textOnly ) {
			debug( `respecting textOnly for string "${ originalFromPage }"` );
			return displayedTranslationFromPage;
		}

		const props = {
			singular: originalFromPage,
			locale: this.currentLocale,
		};

		let key = originalFromPage;

		// Has Context
		if ( 'string' === typeof optionsFromPage.context ) {
			props.context = optionsFromPage.context;
			key = `${ optionsFromPage.context }\u0004${ originalFromPage }`;
		}

		// Has Plural
		if ( 'string' === typeof optionsFromPage.plural ) {
			props.plural = optionsFromPage.plural;
		}

		// Has no translation in current locale
		if ( isEmpty( this.languageJson[ key ] ) ) {
			props.untranslated = 'true';
		}

		// <Translatable> returns a frozen object, therefore we make a copy so that we can modify it below
		const translatableElement = Object.assign(
			{},
			<Translatable { ...props }>{ displayedTranslationFromPage }</Translatable>
		);

		// now we can override the toString function which would otherwise return [object Object]
		translatableElement.toString = () => {
			// do something with displayedTranslationFromPage
			return displayedTranslationFromPage;
		};

		// freeze the object again to certify the same behavior as the original ReactElement object
		Object.freeze( translatableElement );

		return translatableElement;
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

	render() {
		return null;
	}
}

export default connect( ( state, props ) => {
	return {};
} )( localize( CommunityTranslator ) );
