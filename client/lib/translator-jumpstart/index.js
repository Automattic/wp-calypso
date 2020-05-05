/**
 * External dependencies
 */
import { isMobile } from '@automattic/viewport';
import debugModule from 'debug';
import React from 'react';
import i18n from 'i18n-calypso';
import { find, isUndefined } from 'lodash';

/**
 * Internal dependencies
 */
import { languages } from 'languages';
import { loadjQueryDependentScriptDesktopWrapper } from 'lib/load-jquery-dependent-script-desktop-wrapper';
import User from 'lib/user';
import { recordTracksEvent } from 'lib/analytics/tracks';
import { canBeTranslated } from 'lib/i18n-utils';

const debug = debugModule( 'calypso:community-translator' );

const user = new User(),
	communityTranslatorBaseUrl = 'https://widgets.wp.com/community-translator/',
	communityTranslatorVersion = '1.160729',
	// lookup for the translation set slug on GP
	translateSetSlugs = {
		de_formal: 'formal',
	},
	translationDataFromPage = {
		localeCode: 'en',
		languageName: 'English',
		pluralForms: 'nplurals=2; plural=(n != 1)',
		contentChangedCallback() {},
		glotPress: {
			url: 'https://translate.wordpress.com',
			project: 'wpcom',
			translation_set_slug: 'default',
		},
	};

/**
 * Local variables
 */

let injectUrl,
	initialized,
	_isTranslatorEnabled,
	_isUserSettingsReady = false,
	_shouldWrapTranslations = false;

/* "Enabled" means that the user has opted in on the settings page
 *     ( but it's false until userSettings has loaded)
 * "Activated" means that the translator is toggled on, and wrapTranslate()
 *     will add the data tags that the translator needs.
 */
const communityTranslatorJumpstart = {
	isEnabled() {
		const currentUser = user.get();

		// disable for locales
		if (
			! currentUser ||
			! currentUser.localeSlug ||
			! canBeTranslated( currentUser.localeSlug )
		) {
			return false;
		}

		// disable for locale variants with no official GP translation sets
		if ( currentUser.localeVariant && ! canBeTranslated( currentUser.localeVariant ) ) {
			return false;
		}

		if ( ! _isUserSettingsReady ) {
			return false;
		}

		if ( ! _isTranslatorEnabled ) {
			return false;
		}

		// restrict mobile devices from translator for now while we refine touch interactions
		if ( ! communityTranslatorJumpstart.isValidBrowser() ) {
			return false;
		}

		return true;
	},

	isActivated() {
		return _shouldWrapTranslations;
	},

	wrapTranslation( originalFromPage, displayedTranslationFromPage, optionsFromPage ) {
		if ( ! this.isEnabled() || ! this.isActivated() || optionsFromPage.textOnly ) {
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
			debug( 'respecting textOnly for string "' + originalFromPage + '"' );
			return displayedTranslationFromPage;
		}

		const props = {
			className: 'translatable',
			'data-singular': originalFromPage,
		};

		// Has Context
		if ( 'string' === typeof optionsFromPage.context ) {
			props[ 'data-context' ] = optionsFromPage.context;
		}

		// Has Plural
		if ( 'string' === typeof optionsFromPage.plural ) {
			props[ 'data-plural' ] = optionsFromPage.plural;
		}

		// <data> returns a frozen object, therefore we make a copy so that we can modify it below
		const dataElement = Object.assign(
			{},
			<data { ...props }>{ displayedTranslationFromPage }</data>
		);

		// now we can override the toString function which would otherwise return [object Object]
		dataElement.toString = () => displayedTranslationFromPage;

		// freeze the object again to certify the same behavior as the original ReactElement object
		Object.freeze( dataElement );

		return dataElement;
	},

	init( isUserSettingsReady ) {
		const languageJson = i18n.getLocale() || { '': {} };
		const { localeSlug: localeCode, localeVariant } = languageJson[ '' ];

		if ( localeCode && languageJson ) {
			this.updateTranslationData( localeCode, languageJson, localeVariant );
		} else {
			debug( 'trying to initialize translator without loaded language' );
		}

		if ( initialized ) {
			return;
		}

		if ( ! isUndefined( isUserSettingsReady ) ) {
			_isUserSettingsReady = isUserSettingsReady;
		}
		if ( ! _isUserSettingsReady ) {
			debug( 'initialization failed because userSettings are not ready' );
			return;
		}

		if ( ! this.isEnabled() ) {
			debug( 'not initializing, not enabled' );
			return;
		}

		if ( ! localeCode || ! languageJson ) {
			return;
		}

		debug( 'Successfully initialized' );
		initialized = true;
	},

	updateTranslationData( localeCode, languageJson, localeVariant = null ) {
		if ( translationDataFromPage.localeCode === localeCode ) {
			// if the locale code has already been assigned then assume it is up to date
			debug( 'skipping updating translation data with same localeCode' );
			return true;
		}

		debug( 'Translator Jumpstart: loading locale file for ' + localeCode );
		translationDataFromPage.localeCode = localeCode;
		translationDataFromPage.pluralForms =
			languageJson[ '' ].plural_forms ||
			languageJson[ '' ][ 'Plural-Forms' ] ||
			languageJson[ '' ][ 'plural-forms' ] ||
			translationDataFromPage.pluralForms;
		translationDataFromPage.currentUserId = user.data.ID;

		const currentLocale = find( languages, ( lang ) => lang.langSlug === localeCode );
		if ( currentLocale ) {
			translationDataFromPage.languageName = currentLocale.name.replace(
				/^(?:[a-z]{2,3}|[a-z]{2}-[a-z]{2})\s+-\s+/,
				''
			);
		}

		this.setInjectionURL( 'community-translator.min.js' );

		translationDataFromPage.glotPress.translation_set_slug =
			translateSetSlugs[ localeVariant ] || 'default';
	},

	setInjectionURL( jsFile ) {
		injectUrl = communityTranslatorBaseUrl + jsFile + '?v=' + communityTranslatorVersion;
		debug( 'setting injection url', injectUrl );
	},

	toggle() {
		let unregisteredHandleWarning = false;

		translationDataFromPage.contentChangedCallback = () => {
			if ( ! unregisteredHandleWarning ) {
				debug( 'Translator notified of page change, but handler was not registered' );
				unregisteredHandleWarning = true;
			}
		};

		function activate() {
			// Wrap DOM elements and then activate the translator
			_shouldWrapTranslations = true;
			i18n.reRenderTranslations();
			window.communityTranslator.load();
			debug( 'Translator activated' );
			return true;
		}

		function deactivate() {
			window.communityTranslator.unload();
			// Remove all the data tags from the DOM
			_shouldWrapTranslations = false;
			i18n.reRenderTranslations();
			debug( 'Translator deactivated' );
			return false;
		}

		window.translatorJumpstart = translationDataFromPage;

		if ( 'undefined' === typeof window.communityTranslator ) {
			if ( ! injectUrl ) {
				debug( 'Community translator toggled before initialization' );
				_shouldWrapTranslations = false;
				return false;
			}
			debug( 'loading community translator' );
			loadjQueryDependentScriptDesktopWrapper( injectUrl, function ( error ) {
				if ( error ) {
					debug( 'Script ' + error.src + ' failed to load.' );
					return;
				}

				debug( 'Script loaded!' );

				window.communityTranslator.registerTranslatedCallback(
					communityTranslatorJumpstart.updateTranslation
				);
				activate();
			} );
			return false;
		}

		if ( ! this.isActivated() ) {
			activate();
		} else {
			deactivate();
		}

		return this.isActivated();
	},

	// Merge a Community Translator TranslationPair into the i18n locale
	updateTranslation( newTranslation ) {
		const locale = i18n.getLocale(),
			key = newTranslation.key,
			plural = newTranslation.plural,
			translations = newTranslation.translations;
		// jed expects:
		// 'context\004singular': [plural, translatedSingular, translatedPlural...]
		debug(
			'Updating ',
			newTranslation.singular,
			'from',
			locale[ key ],
			'to',
			[ plural ].concat( translations )
		);
		locale[ key ] = [ plural ].concat( translations );

		i18n.setLocale( locale );
	},

	isValidBrowser() {
		if ( isMobile() ) {
			return false;
		}

		return true;
	},
};

// wrap translations from i18n
i18n.registerTranslateHook( ( translation, options ) => {
	return communityTranslatorJumpstart.wrapTranslation( options.original, translation, options );
} );

// callback when translated component changes.
// the callback is overwritten by the translator on load/unload, so we're returning it within an anonymous function.
i18n.registerComponentUpdateHook( () => {
	if ( typeof translationDataFromPage.contentChangedCallback === 'function' ) {
		return translationDataFromPage.contentChangedCallback();
	}
} );

export function trackTranslatorStatus( isTranslatorEnabled ) {
	const newSetting = isTranslatorEnabled,
		changed = _isTranslatorEnabled !== newSetting,
		tracksEvent = newSetting
			? 'calypso_community_translator_enabled'
			: 'calypso_community_translator_disabled';

	if ( changed && _isTranslatorEnabled !== undefined ) {
		debug( tracksEvent );
		recordTracksEvent( tracksEvent, { locale: user.data.localeSlug } );
	}

	_isTranslatorEnabled = newSetting;
}

// re-initialize when new locale data is loaded
i18n.on( 'change', communityTranslatorJumpstart.init.bind( communityTranslatorJumpstart ) );

export default communityTranslatorJumpstart;
