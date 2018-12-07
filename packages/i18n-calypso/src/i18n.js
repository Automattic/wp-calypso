/** @format */
/**
 * External dependencies
 */
import debugFactory from 'debug';
import interpolateComponents from 'interpolate-components';
import Jed from 'jed';
import LRU from 'lru';
import moment from 'moment-timezone';
import sha1 from 'hash.js/lib/hash/sha/1';
import { EventEmitter } from 'events';

/**
 * Internal dependencies
 */
import numberFormat from './number-format';

/**
 * Constants
 */
const debug = debugFactory( 'i18n-calypso' );
const decimal_point_translation_key = 'number_format_decimals';
const thousands_sep_translation_key = 'number_format_thousands_sep';

const translationLookup = [
	// By default don't modify the options when looking up translations.
	function( options ) {
		return options;
	},
];

const hashCache = {};

// raise a console warning
function warn() {
	if ( ! I18N.throwErrors ) {
		return;
	}
	if ( 'undefined' !== typeof window && window.console && window.console.warn ) {
		window.console.warn.apply( window.console, arguments );
	}
}

// turns Function.arguments into an array
function simpleArguments( args ) {
	return Array.prototype.slice.call( args );
}

/**
 * Coerce the possible arguments and normalize to a single object
 * @param  {arguments} args - arguments passed in from `translate()`
 * @return {object}         - a single object describing translation needs
 */
function normalizeTranslateArguments( args ) {
	const original = args[ 0 ];
	let options = {};
	let i;

	// warn about older deprecated syntax
	if (
		typeof original !== 'string' ||
		args.length > 3 ||
		( args.length > 2 && typeof args[ 1 ] === 'object' && typeof args[ 2 ] === 'object' )
	) {
		warn(
			'Deprecated Invocation: `translate()` accepts ( string, [string], [object] ). These arguments passed:',
			simpleArguments( args ),
			'. See https://github.com/Automattic/i18n-calypso#translate-method'
		);
	}
	if ( args.length === 2 && typeof original === 'string' && typeof args[ 1 ] === 'string' ) {
		warn(
			'Invalid Invocation: `translate()` requires an options object for plural translations, but passed:',
			simpleArguments( args )
		);
	}

	// options could be in position 0, 1, or 2
	// sending options as the first object is deprecated and will raise a warning
	for ( i = 0; i < args.length; i++ ) {
		if ( typeof args[ i ] === 'object' ) {
			options = args[ i ];
		}
	}

	// `original` can be passed as first parameter or as part of the options object
	// though passing original as part of the options is a deprecated approach and will be removed
	if ( typeof original === 'string' ) {
		options.original = original;
	} else if ( typeof options.original === 'object' ) {
		options.plural = options.original.plural;
		options.count = options.original.count;
		options.original = options.original.single;
	}
	if ( typeof args[ 1 ] === 'string' ) {
		options.plural = args[ 1 ];
	}

	if ( typeof options.original === 'undefined' ) {
		throw new Error( 'Translate called without a `string` value as first argument.' );
	}

	return options;
}

/**
 * Pull the right set of arguments for the Jed method
 * @param  {string} jedMethod Name of jed gettext-style method. [See docs](http://slexaxton.github.io/Jed/)
 * @param  {[object]} props     properties passed into `translate()` method
 * @return {[array]}           array of properties to pass into gettext-style method
 */
function getJedArgs( jedMethod, props ) {
	switch ( jedMethod ) {
		case 'gettext':
			return [ props.original ];
		case 'ngettext':
			return [ props.original, props.plural, props.count ];
		case 'npgettext':
			return [ props.context, props.original, props.plural, props.count ];
		case 'pgettext':
			return [ props.context, props.original ];
	}

	return [];
}

/**
 * Takes translate options object and coerces to a Jed request to retrieve translation
 * @param  {object} jed     - jed data object
 * @param  {object} options - object describing translation
 * @return {string}         - the returned translation from Jed
 */
function getTranslationFromJed( jed, options ) {
	let jedMethod = 'gettext';

	if ( options.context ) {
		jedMethod = 'p' + jedMethod;
	}

	if ( typeof options.original === 'string' && typeof options.plural === 'string' ) {
		jedMethod = 'n' + jedMethod;
	}

	const jedArgs = getJedArgs( jedMethod, options );

	return jed[ jedMethod ].apply( jed, jedArgs );
}

function getTranslation( i18n, options ) {
	let i, lookup;

	for ( i = translationLookup.length - 1; i >= 0; i-- ) {
		lookup = translationLookup[ i ]( Object.assign( {}, options ) );
		// Only get the translation from jed if it exists.
		if ( i18n.state.locale[ lookup.original ] ) {
			return getTranslationFromJed( i18n.state.jed, lookup );
		}
	}

	return null;
}

function I18N() {
	if ( ! ( this instanceof I18N ) ) {
		return new I18N();
	}
	this.defaultLocaleSlug = 'en';
	this.state = {
		numberFormatSettings: {},
		jed: undefined,
		locale: undefined,
		localeSlug: undefined,
		translations: LRU( { max: 100 } ),
	};
	this.componentUpdateHooks = [];
	this.translateHooks = [];
	this.stateObserver = new EventEmitter();
	// Because the higher-order component can wrap a ton of React components,
	// we need to bump the number of listeners to infinity and beyond
	// FIXME: still valid?
	this.stateObserver.setMaxListeners( 0 );
	// default configuration
	this.configure();
}

I18N.throwErrors = false;
I18N.prototype.moment = moment;

/**
 * Formats numbers using locale settings and/or passed options
 * @param  {String|Number|Int}  number to format (required)
 * @param  {Int|object} options  Number of decimal places or options object (optional)
 * @return {string}         Formatted number as string
 */
I18N.prototype.numberFormat = function( number ) {
	const options = arguments[ 1 ] || {},
		decimals = typeof options === 'number' ? options : options.decimals || 0,
		decPoint = options.decPoint || this.state.numberFormatSettings.decimal_point || '.',
		thousandsSep = options.thousandsSep || this.state.numberFormatSettings.thousands_sep || ',';

	return numberFormat( number, decimals, decPoint, thousandsSep );
};

I18N.prototype.configure = function( options ) {
	Object.assign( this, options || {} );
	this.setLocale();
};

I18N.prototype.setLocale = function( localeData ) {
	if ( localeData && localeData[ '' ] && localeData[ '' ][ 'key-hash' ] ) {
		let hashLength;
		let minHashLength;
		let maxHashLength;
		const keyHash = localeData[ '' ][ 'key-hash' ];

		const transform = function( string, innerHashLength ) {
			const lookupPrefix = innerHashLength === false ? '' : String( innerHashLength );
			if ( typeof hashCache[ lookupPrefix + string ] !== 'undefined' ) {
				return hashCache[ lookupPrefix + string ];
			}
			const hash = sha1()
				.update( string )
				.digest( 'hex' );

			if ( innerHashLength ) {
				return ( hashCache[ lookupPrefix + string ] = hash.substr( 0, innerHashLength ) );
			}

			return ( hashCache[ lookupPrefix + string ] = hash );
		};

		const generateLookup = function( innerHashLength ) {
			return function( options ) {
				if ( options.context ) {
					options.original = transform(
						options.context + String.fromCharCode( 4 ) + options.original,
						innerHashLength
					);
					delete options.context;
				} else {
					options.original = transform( options.original, innerHashLength );
				}

				return options;
			};
		};

		if ( keyHash.substr( 0, 4 ) === 'sha1' ) {
			if ( keyHash.length === 4 ) {
				translationLookup.push( generateLookup( false ) );
			} else {
				const variableHashLengthPos = keyHash.substr( 5 ).indexOf( '-' );
				if ( variableHashLengthPos < 0 ) {
					hashLength = Number( keyHash.substr( 5 ) );
					translationLookup.push( generateLookup( hashLength ) );
				} else {
					minHashLength = Number( keyHash.substr( 5, variableHashLengthPos ) );
					maxHashLength = Number( keyHash.substr( 6 + variableHashLengthPos ) );

					for ( hashLength = minHashLength; hashLength <= maxHashLength; hashLength++ ) {
						translationLookup.push( generateLookup( hashLength ) );
					}
				}
			}
		}
	}

	// if localeData is not given, assumes default locale and reset
	if ( ! localeData || ! localeData[ '' ].localeSlug ) {
		this.state.locale = { '': { localeSlug: this.defaultLocaleSlug } };
	} else if ( localeData[ '' ].localeSlug === this.state.localeSlug ) {
		// Exit if same data as current (comparing references only)
		if ( localeData === this.state.locale ) {
			return;
		}

		// merge new data into existing one
		Object.assign( this.state.locale, localeData );
	} else {
		this.state.locale = Object.assign( {}, localeData );
	}

	this.state.localeSlug = this.state.locale[ '' ].localeSlug;

	this.state.jed = new Jed( {
		locale_data: {
			messages: this.state.locale,
		},
	} );

	moment.locale( this.state.localeSlug );

	// Updates numberFormat preferences with settings from translations
	this.state.numberFormatSettings.decimal_point = getTranslationFromJed(
		this.state.jed,
		normalizeTranslateArguments( [ decimal_point_translation_key ] )
	);
	this.state.numberFormatSettings.thousands_sep = getTranslationFromJed(
		this.state.jed,
		normalizeTranslateArguments( [ thousands_sep_translation_key ] )
	);

	// If translation isn't set, define defaults.
	if ( this.state.numberFormatSettings.decimal_point === decimal_point_translation_key ) {
		this.state.numberFormatSettings.decimal_point = '.';
	}

	if ( this.state.numberFormatSettings.thousands_sep === thousands_sep_translation_key ) {
		this.state.numberFormatSettings.thousands_sep = ',';
	}

	this.state.translations.clear();
	this.stateObserver.emit( 'change' );
};

I18N.prototype.getLocale = function() {
	return this.state.locale;
};

/**
 * Get the current locale slug.
 * @returns {string} The string representing the currently loaded locale
 **/
I18N.prototype.getLocaleSlug = function() {
	return this.state.localeSlug;
};

/**
 * Adds new translations to the locale data, overwriting any existing translations with a matching key
 * @param {Object} localeData Locale data
 */
I18N.prototype.addTranslations = function( localeData ) {
	for ( const prop in localeData ) {
		if ( prop !== '' ) {
			this.state.jed.options.locale_data.messages[ prop ] = localeData[ prop ];
		}
	}

	this.state.translations.clear();
	this.stateObserver.emit( 'change' );
};

/**
 * Checks whether the given original has a translation. Parameters are the same as for translate().
 *
 * @param  {string} original  the string to translate
 * @param  {string} plural    the plural string to translate (if applicable), original used as singular
 * @param  {object} options   properties describing translation requirements for given text
 * @return {boolean} whether a translation exists
 */
I18N.prototype.hasTranslation = function() {
	return !! getTranslation( this, normalizeTranslateArguments( arguments ) );
};

/**
 * Exposes single translation method, which is converted into its respective Jed method.
 * See sibling README
 * @param  {string} original  the string to translate
 * @param  {string} plural    the plural string to translate (if applicable), original used as singular
 * @param  {object} options   properties describing translation requirements for given text
 * @return {string|React-components} translated text or an object containing React children that can be inserted into a parent component
 */
I18N.prototype.translate = function() {
	let translation, sprintfArgs, errorMethod, optionsString, cacheable;

	const options = normalizeTranslateArguments( arguments );

	cacheable = ! options.components;
	if ( cacheable ) {
		// Safe JSON stringification here to catch Circular JSON error
		// caused by passing a React component into args where only scalars are allowed
		try {
			optionsString = JSON.stringify( options );
		} catch ( e ) {
			cacheable = false;
		}

		if ( optionsString ) {
			translation = this.state.translations.get( optionsString );
			// Return the cached translation.
			if ( translation ) {
				return translation;
			}
		}
	}

	translation = getTranslation( this, options );
	if ( ! translation ) {
		// This purposefully calls jed for a case where there is no translation,
		// so that jed gives us the expected object with English text.
		translation = getTranslationFromJed( this.state.jed, options );
	}

	// handle any string substitution
	if ( options.args ) {
		sprintfArgs = Array.isArray( options.args ) ? options.args.slice( 0 ) : [ options.args ];
		sprintfArgs.unshift( translation );
		try {
			translation = Jed.sprintf.apply( Jed, sprintfArgs );
		} catch ( error ) {
			if ( ! window || ! window.console ) {
				return;
			}
			errorMethod = this.throwErrors ? 'error' : 'warn';
			if ( typeof error !== 'string' ) {
				window.console[ errorMethod ]( error );
			} else {
				window.console[ errorMethod ]( 'i18n sprintf error:', sprintfArgs );
			}
		}
	}

	// interpolate any components
	if ( options.components ) {
		translation = interpolateComponents( {
			mixedString: translation,
			components: options.components,
			throwErrors: this.throwErrors,
		} );
	}

	// run any necessary hooks
	this.translateHooks.forEach( function( hook ) {
		translation = hook( translation, options );
	} );

	if ( cacheable ) {
		this.state.translations.set( optionsString, translation );
	}

	return translation;
};

/**
 * Causes i18n to re-render all translations.
 *
 * This can be necessary if an extension makes changes that i18n is unaware of
 * and needs those changes manifested immediately (e.g. adding an important
 * translation hook, or modifying the behaviour of an existing hook).
 *
 * If at all possible, react components should try to use the more local
 * updateTranslation() function inherited from the mixin.
 */
I18N.prototype.reRenderTranslations = function() {
	debug( 'Re-rendering all translations due to external request' );
	this.state.translations.clear();
	this.stateObserver.emit( 'change' );
};

I18N.prototype.registerComponentUpdateHook = function( callback ) {
	this.componentUpdateHooks.push( callback );
};

I18N.prototype.registerTranslateHook = function( callback ) {
	this.translateHooks.push( callback );
};

module.exports = I18N;
