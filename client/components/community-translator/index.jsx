/**
 * External dependencies
 */
import React, { Component } from 'react';
import i18n, { localize } from 'i18n-calypso';
import debugModule from 'debug';
import { find, isEmpty } from 'lodash';
/**
 * Internal dependencies
 */
import Translatable from './translatable';
import { languages } from 'languages';
import userSettings from 'lib/user-settings';
import { isCommunityTranslatorEnabled } from 'components/community-translator/utils';

/**
 * Style dependencies
 */
import './style.scss';

/**
 * Local variables
 */
const debug = debugModule( 'calypso:community-translator' );

class CommunityTranslator extends Component {
	languageJson = null;
	currentLocale = null;
	initialized = false;

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
		userSettings.on( 'change', this.refresh );
	}

	componentWillUnmount() {
		i18n.off( 'change', this.refresh );
		userSettings.removeListener( 'change', this.refresh );
	}

	setLanguage() {
		this.languageJson = i18n.getLocale() || { '': {} };
		// The '' here is a Jed convention used for storing configuration data
		// alongside translations in the same dictionary (because '' will never
		// be a legitimately translatable string)
		// See https://messageformat.github.io/Jed/
		const { localeSlug, localeVariant } = this.languageJson[ '' ];
		this.localeCode = localeVariant || localeSlug;
		this.currentLocale = find( languages, ( lang ) => lang.langSlug === this.localeCode );
	}

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
	 * Wraps translation in a DOM object and attaches `toString()` method in case in can't be rendered
	 * @param { String } originalFromPage - original string
	 * @param { String } displayedTranslationFromPage - translated string
	 * @param  { Object } optionsFromPage - i18n.translate options
	 * @returns {object} DOM object
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

		if ( optionsFromPage.textOnly ) {
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

			// see how Jed defines \u0004 as the delimiter here: https://messageformat.github.io/Jed/
			key = `${ optionsFromPage.context }\u0004${ originalFromPage }`;
		}

		// Has Plural
		if ( 'string' === typeof optionsFromPage.plural ) {
			props.plural = optionsFromPage.plural;
		}

		// Has no translation in current locale
		// Must be a string to be a valid DOM attribute value
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
			// here we can store the strings that cannot be rendered to the page
			return displayedTranslationFromPage;
		};

		// freeze the object again to certify the same behavior as the original ReactElement object
		Object.freeze( translatableElement );

		return translatableElement;
	}

	render() {
		return null;
	}
}

export default localize( CommunityTranslator );
