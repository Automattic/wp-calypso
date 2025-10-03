import languages from '@automattic/languages';
import debugModule from 'debug';
import i18n, { localize } from 'i18n-calypso';
import { find, isEmpty } from 'lodash';
import { Component } from 'react';
import { connect } from 'react-redux';
import QueryUserSettings from 'calypso/components/data/query-user-settings';
import isCommunityTranslatorEnabled from 'calypso/state/selectors/is-community-translator-enabled';
import Translatable from './translatable';

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
		this.i18nUnsubscribe = i18n.subscribe( this.refresh );
	}

	componentWillUnmount() {
		this.i18nUnsubscribe();
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

		if ( ! this.props.isCommunityTranslatorEnabled ) {
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
	 * @param {string} originalFromPage - original string
	 * @param {string} displayedTranslationFromPage - translated string
	 * @param  { Object } optionsFromPage - i18n.translate options
	 * @returns {Object} DOM object
	 */
	wrapTranslation( originalFromPage, displayedTranslationFromPage, optionsFromPage ) {
		if ( ! this.props.isCommunityTranslatorEnabled ) {
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
		return <QueryUserSettings />;
	}
}

export default connect( ( state ) => ( {
	isCommunityTranslatorEnabled: isCommunityTranslatorEnabled( state ),
} ) )( localize( CommunityTranslator ) );
