/** @format */
/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import i18n, { localize } from 'i18n-calypso';
import debugModule from 'debug';
import { find, isEmpty } from 'lodash';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Translatable from './translatable';
import { canDisplayCommunityTranslator } from 'components/community-translator/utils';
import { loadUndeployedTranslations } from 'lib/i18n-utils/switch-locale';
import { getCurrentUserName } from 'state/current-user/selectors';
import getUserSetting from 'state/selectors/get-user-setting.js';
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

class CommunityTranslator extends PureComponent {
	state = { currentLocale: null };

	componentDidMount() {
		// wrap translations from i18n
		debug( 'registering wrapTranslation()' );
		i18n.registerTranslateHook( ( translation, options ) =>
			this.wrapTranslation( options.original, translation, options )
		);

		// callback when translated component changes.
		// the callback is overwritten by the translator on load/unload, so we're returning it within an anonymous function.
		i18n.registerComponentUpdateHook( () => {} );
		i18n.on( 'change', this.checkForI18nLocaleChange );
		this.checkForI18nLocaleChange();
	}

	componentDidUpdate() {
		if ( ! this.props.translatorEnabled ) {
			return;
		}

		// Anything in our props or state changing means we need a new check
		this.setLanguage();
	}

	// Trigger react updates when i18n changes locale (and not just an
	// individual translation)
	//
	// We could use the current user locale & variant out of the redux state,
	// but this way avoids a race condition between the loading the normal
	// locale translations and the undeployed translations for the user.
	checkForI18nLocaleChange = () => {
		const { localeSlug, localeVariant } = i18n.getLocale()[ '' ];
		const newLocaleCode = localeVariant || localeSlug;
		const { currentLocale } = this.state || {};

		if ( ! currentLocale || newLocaleCode !== currentLocale.langSlug ) {
			debug( 'Changing locale to ' + newLocaleCode );
			this.setState( {
				currentLocale: find( languages, lang => lang.langSlug === newLocaleCode ),
			} );
		}
	};

	componentWillUnmount() {
		i18n.off( 'change', this.checkForI18nLocaleChange );
	}

	setLanguage() {
		// The '' here is a Jed convention used for storing configuration data
		// alongside translations in the same dictionary (because '' will never
		// be a legitimately translatable string)
		// See https://messageformat.github.io/Jed/
		const { localeSlug, localeVariant } = i18n.getLocale()[ '' ];
		const { username } = this.props;

		if ( ! canDisplayCommunityTranslator( localeSlug, localeVariant ) ) {
			return;
		}

		const newLocaleCode = localeVariant || localeSlug;

		if ( ! canDisplayCommunityTranslator( localeSlug, localeVariant ) ) {
			debug( 'community translator not activated for ', newLocaleCode );
			return;
		}

		debug( "fetching user's waiting translations", username, newLocaleCode );
		loadUndeployedTranslations( { username, locale: newLocaleCode, translationStatus: 'waiting' } );
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

		if ( ! canDisplayCommunityTranslator() ) {
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
			locale: this.state.currentLocale,
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

export default connect( mapState )( localize( CommunityTranslator ) );
