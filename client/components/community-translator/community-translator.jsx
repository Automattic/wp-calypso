/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import i18n, { localize, reRenderTranslations } from 'i18n-calypso';
import debugModule from 'debug';
import { find, isEmpty, isMatch } from 'lodash';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Translatable from './translatable';
import { languages } from 'languages';
import { canDisplayCommunityTranslator } from 'components/community-translator/utils';
import { loadUndeployedTranslations } from 'lib/i18n-utils/switch-locale';
import { getCurrentUserName } from 'state/current-user/selectors';
import getUserSetting from 'state/selectors/get-user-setting';
import { ENABLE_TRANSLATOR_KEY } from 'lib/i18n-utils/constants';
import QueryUserSettings from 'components/data/query-user-settings';

/**
 * Style dependencies
 */
import './style.scss';

/**
 * Local variables
 */
const debug = debugModule( 'calypso:community-translator' );

/**
 * @returns {Object} of shape { localeSlug, localeVariant, localeCode } (all strings)
 */
function getLocaleSlugsFromLoadedTranslations() {
	const { localeSlug, localeVariant } = i18n.getLocale()[ '' ];
	return {
		localeSlug,
		localeVariant,
		localeCode: localeVariant || localeSlug,
	};
}

class CommunityTranslator extends Component {
	currentLocale = { localeSlug: 'en' };

	componentDidMount() {
		// wrap translations from i18n
		debug( 'registering wrapTranslation()' );
		i18n.registerTranslateHook( ( translation, options ) =>
			this.wrapTranslation( options.original, translation, options )
		);

		this.componentDidMountOrUpdate();
	}

	componentDidUpdate( prevprops ) {
		this.componentDidMountOrUpdate( prevprops );
	}

	componentDidMountOrUpdate( prevprops = {} ) {
		const { username, translatorEnabled } = this.props;
		if ( ! this.props.translatorEnabled ) {
			if ( prevprops.translatorEnabled ) {
				reRenderTranslations();
			}
			return;
		}

		// This is a bit weird because we get forcedUpdates from i18n where
		// our props haven't changed in addition to normal props-driven updates
		const { localeCode: newLocaleCode } = getLocaleSlugsFromLoadedTranslations();

		const languageChanged = this.setLanguageIfNecessary();

		// ignore additional props from i18n-calypso
		const relevantProps = { username, translatorEnabled };
		if ( languageChanged || ! isMatch( prevprops, relevantProps ) ) {
			debug( "fetching user's waiting translations", username, newLocaleCode );
			loadUndeployedTranslations( {
				username,
				project: 'test', // TMP TESTING
				locale: newLocaleCode,
				translationStatus: 'waiting',
			} );
		}

		// We need to force a rerender if the translator has just been enabled
		// i18n will force a rerender if the language has changed, so we
		// shouldn't cause another.
		if ( ! languageChanged && ! prevprops.translatorEnabled ) {
			reRenderTranslations();
		}
	}

	/**
	 * @return {bool} returns true if the current language actually changed.
	 */
	setLanguageIfNecessary() {
		// The '' here is a Jed convention used for storing configuration data
		// alongside translations in the same dictionary (because '' will never
		// be a legitimately translatable string)
		// See https://messageformat.github.io/Jed/
		const { localeSlug, localeVariant } = i18n.getLocale()[ '' ];
		const { username } = this.props;
		const newLocaleCode = localeVariant || localeSlug;

		if ( newLocaleCode === this.currentLocale.langSlug ) {
			return;
		}

		debug( 'Changing locale to ' + newLocaleCode );
		this.currentLocale = find( languages, lang => lang.langSlug === newLocaleCode );

		if ( ! canDisplayCommunityTranslator( localeSlug, localeVariant ) ) {
			debug(
				`community translator not activated for ${ newLocaleCode } (${ localeSlug }/${ localeVariant })`
			);
			return;
		}

		debug(
			`community translator activated for ${ newLocaleCode } (${ localeSlug }/${ localeVariant })`
		);
		debug( "fetching user's waiting translations", username, newLocaleCode );
		loadUndeployedTranslations( { username, locale: newLocaleCode, translationStatus: 'waiting' } );
		return true;
	}

	/**
	 * Wraps translation in a DOM object and attaches `toString()` method in case in can't be rendered
	 * @param { String } originalFromPage - original string
	 * @param { String } displayedTranslationFromPage - translated string
	 * @param  { Object } optionsFromPage - i18n.translate options
	 * @returns {Object} DOM object
	 */
	wrapTranslation( originalFromPage, displayedTranslationFromPage, optionsFromPage ) {
		if ( ! this.props.translatorEnabled ) {
			return displayedTranslationFromPage;
		}

		// This checks the currently loaded translations rather than user
		// settings or the last one we saw.
		// This means when a user changes locale, it will still show
		// the old translations until the new translations are loaded, but:
		// - it won't try to show translations when it can't
		// - it will change all the translations over when i18n-calypso
		//   triggers a rerender (it can't "miss" part of the rerender due to
		//   the order of callbacks triggered by the change)
		const currentlyLoadedTranslationsSlug = getLocaleSlugsFromLoadedTranslations().localeCode;
		if ( ! canDisplayCommunityTranslator( currentlyLoadedTranslationsSlug ) ) {
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
		if ( isEmpty( i18n.getLocale()[ key ] ) ) {
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

const mapState = state => ( {
	username: getCurrentUserName( state ),
	translatorEnabled: getUserSetting( state, ENABLE_TRANSLATOR_KEY ),
} );

// The i18n-calypso localize() HOC will force an update when i18n changes
// (see boundForceUpdate()), so we use it to react to those changes even though
// we actually don't use translate() directly.
export default connect( mapState )( localize( CommunityTranslator ) );
