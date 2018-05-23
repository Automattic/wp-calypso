/** @format */
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
import config from 'config';
import User from 'lib/user';
import userSettings from 'lib/user-settings';
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

	componentDidMount() {
		this.setLanguage();

		// wrap translations from i18n
		i18n.registerTranslateHook( ( translation, options ) =>
			this.wrapTranslation( options.original, translation, options )
		);

		// callback when translated component changes.
		// the callback is overwritten by the translator on load/unload, so we're returning it within an anonymous function.
		i18n.registerComponentUpdateHook( () => {} );
		i18n.on( 'change', this.setLanguage );
		user.on( 'change', this.setLanguage );
		userSettings.on( 'change', this.setLanguage );
	}

	componentWillUnmount() {
		i18n.off( 'change', this.setLanguage );
		user.off( 'change', this.setLanguage );
		userSettings.off( 'change', this.setLanguage );
	}

	setLanguage() {
		this.languageJson = i18n.getLocale() || { '': {} };
		const { localeSlug, localeVariant } = this.languageJson[ '' ];
		this.localeCode = localeVariant || localeSlug;
		this.currentLocale = find( languages, lang => lang.langSlug === this.localeCode );
	}

	/**
	 * Wraps translation in a DOM object and attaches `toString()` method in case in can't be rendered
	 * @param { String } originalFromPage - original string
	 * @param { String } displayedTranslationFromPage - translated string
	 * @param  { Object } optionsFromPage - i18n.translate options
	 * @returns {Object} DOM object
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
