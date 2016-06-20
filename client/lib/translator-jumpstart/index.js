/**
 * External dependencies
 */
var debug = require( 'debug' )( 'calypso:community-translator' ),
	i18n = require( 'i18n-calypso' ),
	React = require( 'react' );

/**
 * Internal dependencies
 */
var config = require( 'config' ),
	loadScript = require( 'lib/load-script' ),
	user = require( 'lib/user' )(),
	userSettings = require( 'lib/user-settings' ),
	isMobile = require( 'lib/viewport' ).isMobile,
	analytics = require( 'lib/analytics' ),
	hasTouch = require( 'lib/touch-detect' ).hasTouch;

/**
 * Local variables
 */
var communityTranslatorBaseUrl = 'https://widgets.wp.com/community-translator/',
	communityTranslatorVersion = '1.160620',
	translationDataFromPage = {
		localeCode: 'en',
		languageName: 'English',
		pluralForms: 'nplurals=2; plural=(n != 1)',
		contentChangedCallback: function() {},
		glotPress: {
			url: 'https://translate.wordpress.com',
			project: 'test'
		}
	},
	communityTranslatorJumpstart, injectUrl, initialized,
	previousEnabledSetting,
	_shouldWrapTranslations = false;

/* "Enabled" means that the user has opted in on the settings page
 *     ( but it's false until userSettings has loaded)
 * "Activated" means that the translator is toggled on, and wrapTranslate()
 *     will add the data tags that the translator needs.
 */
communityTranslatorJumpstart = {
	isEnabled: function() {
		var currentUser;

		if ( ! config.isEnabled( 'community-translator' ) ) {
			return false;
		}

		currentUser = user.get();

		if ( 'en' === currentUser.localeSlug || ! currentUser.localeSlug ) {
			return false;
		}

		if ( ! userSettings.getSettings() ) {
			return false;
		}

		if ( ! userSettings.getOriginalSetting( 'enable_translator' ) ) {
			return false;
		}

		// restrict mobile devices from translator for now while we refine touch interactions
		if ( ! communityTranslatorJumpstart.isValidBrowser() ) {
			return false;
		}

		return true;
	},
	isActivated: function() {
		return _shouldWrapTranslations;
	},

	wrapTranslation: function( originalFromPage, displayedTranslationFromPage, optionsFromPage ) {
		var props, dataElement;

		if ( ! this.isEnabled() || ! this.isActivated() ) {
			return displayedTranslationFromPage;
		}

		if ( 'object' !== typeof optionsFromPage ) {
			optionsFromPage = {};
		}

		props = { className: 'translatable' };

		if ( 'string' === typeof originalFromPage ) {
			props[ 'data-singular' ] = originalFromPage;
		} else {
			debug( 'unknown original format' );
			return displayedTranslationFromPage;
		}

		// Has Context
		if ( 'string' === typeof optionsFromPage.context ) {
			props[ 'data-context' ] = optionsFromPage.context;
		}

		// Has Plural
		if ( 'string' === typeof optionsFromPage.plural ) {
			props[ 'data-plural' ] = optionsFromPage.plural;
		}

		// React.DOM.data returns a frozen object, therefore we make a copy so that we can modify it below
		dataElement = Object.assign( {}, React.DOM.data( props, displayedTranslationFromPage ) );

		// now we can override the toString function which would otherwise return [object Object]
		dataElement.toString = function() {
			return displayedTranslationFromPage;
		}

		// freeze the object again to certify the same behavior as the original ReactElement object
		Object.freeze( dataElement );

		return dataElement;
	},

	init: function() {
		var languageJson = i18n.getLocale() || { '': {} },
			localeCode = languageJson[ '' ].localeSlug;

		if ( localeCode && languageJson ) {
			this.updateTranslationData( localeCode, languageJson );
		} else {
			debug( 'trying to initialize translator without loaded language' );
		}

		if ( initialized ) {
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

		if ( ! localeCode || ! languageJson ) {
			return;
		}

		debug( 'Successfully initialized' );
		initialized = true;
	},

	updateTranslationData: function( localeCode, languageJson ) {
		var languages = config( 'languages' ),
			i;

		if ( translationDataFromPage.localeCode === localeCode ) {
			// if the locale code has already been assigned then assume it is up to date
			debug( 'skipping updating translation data with same localeCode' );
			return true;
		}

		debug( 'Translator Jumpstart: loading locale file for ' + localeCode );
		translationDataFromPage.localeCode = localeCode;
		translationDataFromPage.pluralForms = languageJson[ '' ].plural_forms || languageJson[ '' ][ 'Plural-Forms' ] || languageJson[ '' ][ 'plural-forms' ] || translationDataFromPage.pluralForms;
		translationDataFromPage.currentUserId = user.data.ID;

		// extract the active language's name out of Calypso lanaguage data
		for ( i = 0; i < languages.length; i++ ) {
			if ( languages[ i ].langSlug === localeCode ) {
				translationDataFromPage.languageName = languages[ i ].name.replace( /^(?:[a-z]{2,3}|[a-z]{2}-[a-z]{2})\s+-\s+/, '' );
				break;
			}
		}

		this.setInjectionURL( 'community-translator.min.js' );
		if ( config( 'env' ) === 'production' ) {
			translationDataFromPage.glotPress.project = 'wpcom';
		} else {
			translationDataFromPage.glotPress.project = 'test';
		}
	},

	setInjectionURL: function( jsFile ) {
		debug( 'setting Injection URL' );
		injectUrl = communityTranslatorBaseUrl + jsFile + '?v=' + communityTranslatorVersion;
		debug( 'setting injection url', injectUrl );
	},

	toggle: function() {
		var unregisteredHandleWarning = false;

		translationDataFromPage.contentChangedCallback = function() {
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
			loadScript.loadjQueryDependentScript( injectUrl, function( error ) {
				if ( error ) {
					debug( 'Script ' + error.src + ' failed to load.' );
					return;
				}

				debug( 'Script loaded!' );

				window.communityTranslator.registerTranslatedCallback(
					communityTranslatorJumpstart.updateTranslation );
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
	updateTranslation: function( newTranslation ) {
		var locale = i18n.getLocale(),
			key = newTranslation.key,
			plural = newTranslation.plural,
			translations = newTranslation.translations;
		// jed expects:
		// 'context\004singular': [plural, translatedSingular, translatedPlural...]
		debug( 'Updating ', newTranslation.singular, 'from', locale[ key ],
			'to', [ plural ].concat( translations ) );
		locale[ key ] = [ plural ].concat( translations );

		i18n.setLocale( locale );
	},

	isValidBrowser: function() {
		if ( hasTouch() ) {
			return false;
		}

		if ( isMobile() ) {
			return false;
		}

		return true;
	}
};

// wrap translations from i18n
i18n.registerTranslateHook( function( translation, options ) {
	return communityTranslatorJumpstart.wrapTranslation( options.original, translation, options );
} );

// callback when translated component changes.
// the callback is overwritten by the the translator on load/unload, so we're returning it within an anonymous function.
i18n.registerComponentUpdateHook( function() {
	if ( typeof translationDataFromPage.contentChangedCallback === 'function' ) {
		return translationDataFromPage.contentChangedCallback();
	}
} );

function trackTranslatorStatus() {
	var newSetting = userSettings.getOriginalSetting( 'enable_translator' ),
		changed = previousEnabledSetting !== newSetting,
		tracksEvent = newSetting
			? 'calypso_community_translator_enabled'
			: 'calypso_community_translator_disabled';

	if ( changed && previousEnabledSetting !== undefined ) {
		debug( tracksEvent );
		analytics.tracks.recordEvent( tracksEvent, { locale: user.data.localeSlug } );
	}

	previousEnabledSetting = newSetting;
}

// re-initialize when new locale data is loaded
i18n.on( 'change', communityTranslatorJumpstart.init.bind( communityTranslatorJumpstart ) );
user.on( 'change', communityTranslatorJumpstart.init.bind( communityTranslatorJumpstart ) );
userSettings.on( 'change', trackTranslatorStatus );
userSettings.on( 'change', communityTranslatorJumpstart.init.bind( communityTranslatorJumpstart ) );

module.exports = communityTranslatorJumpstart;
