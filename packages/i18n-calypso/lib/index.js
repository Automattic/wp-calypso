/**
 * External dependencies
 */
var debug = require( 'debug' )( 'i18n' ),
	Jed = require( 'jed' ),
	moment = require( 'moment-timezone' ),
	EventEmitter = require( 'events' ).EventEmitter,
	interpolateComponents = require( 'interpolate-components' ),
	LRU = require( 'lru-cache' ),
	assign = require( 'lodash/assign' );

/**
 * Internal dependencies
 */
var numberFormatPHPJS = require( './number-format' );

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
	var original = args[ 0 ],
		options = {},
		i;

	// warn about older deprecated syntax
	if ( typeof original !== 'string' || args.length > 3 || ( args.length > 2 && typeof args[ 1 ] === 'object' && typeof args[ 2 ] === 'object' ) ) {
		warn( 'Deprecated Invocation: `translate()` accepts ( string, [string], [object] ). These arguments passed:', simpleArguments( args ), '. See client/lib/mixins/i18n#translate-method' );
	}
	if ( args.length === 2 && typeof original === 'string' && typeof args[ 1 ] === 'string' ) {
		warn( 'Invalid Invocation: `translate()` requires an options object for plural translations, but passed:', simpleArguments( args ) );
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
	var argsByMethod = {
		gettext: [ props.original ],
		ngettext: [ props.original, props.plural, props.count ],
		npgettext: [ props.context, props.original, props.plural, props.count ],
		pgettext: [ props.context, props.original ]
	};
	return argsByMethod[ jedMethod ] || [];
}

/**
 * Takes translate options object and coerces to a Jed request to retrieve translation
 * @param  {object} jed     - jed data object
 * @param  {object} options - object describing translation
 * @return {string}         - the returned translation from Jed
 */
function getTranslationFromJed( jed, options ) {
	var jedMethod = 'gettext',
		jedArgs;

	if ( options.context ) {
		jedMethod = 'p' + jedMethod;
	}

	if ( typeof options.original === 'string' && typeof options.plural === 'string' ) {
		jedMethod = 'n' + jedMethod;
	}

	jedArgs = getJedArgs( jedMethod, options );

	return jed[ jedMethod ].apply( jed, jedArgs );
}


function I18N() {
	if( ! ( this instanceof I18N ) ) {
		return new I18N();
	}
	this.defaultLocaleSlug = 'en';
	this.state = {
		numberFormatSettings: {},
		jed: undefined,
		locale: undefined,
		localeSlug: undefined,
		translations: LRU( { max: 100 } )
	};
	this.componentUpdateHooks = [];
	this.translateHooks = [];
	this.stateObserver = new EventEmitter();
	// Because the mixin can be injected into a ton of React components,
	// we need to bump the number of listeners to infinity and beyond
	this.stateObserver.setMaxListeners( 0 );
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
	var options = arguments[ 1 ] || {},
		decimals = ( typeof options === 'number' ) ? options : options.decimals || 0,
		decPoint = options.decPoint || this.state.numberFormatSettings.decimal_point || '.',
		thousandsSep = options.thousandsSep || this.state.numberFormatSettings.thousands_sep || ',';

	return numberFormatPHPJS( number, decimals, decPoint, thousandsSep );
};

I18N.prototype.configure = function( options ) {
	assign( this, options || {} );
	this.setLocale( this.defaultLocaleSlug );
};

/**
 * Initialized with a bootstrapped locale, the currentUser's localeSlug, or default if none available
 * @param  {object} bootstrap The bootstrapped locale file
 */
I18N.prototype.initialize = function( bootstrap ) {
	var localeSlug = this.defaultLocaleSlug;

	if ( bootstrap && typeof bootstrap[ '' ] !== 'undefined' && typeof bootstrap[ '' ].localeSlug !== 'undefined' ) {
		localeSlug = bootstrap[ '' ].localeSlug;
	}

	debug( 'Initialized i18n with bootstrapped locale: ' + localeSlug );

	this.setLocale( localeSlug, bootstrap );
};

I18N.prototype.setLocale = function( localeSlug, localeData ) {
	// Don't change if same locale as current, except for default locale
	if ( localeSlug !== this.defaultLocaleSlug && localeSlug === this.state.localeSlug ) {
		return;
	}

	if ( ! localeData ) {
		localeData = { '': {} };
	}

	this.state.localeSlug = localeData[ '' ].localeSlug = localeSlug;
	this.state.locale = localeData;

	this.state.jed = new Jed( {
		locale_data: {
			messages: localeData
		}
	} );

	if ( localeData[ '' ].momentjs_locale ) {
		moment.locale( localeSlug, localeData[ '' ].momentjs_locale );
		this.state.numberFormatSettings = localeData[ '' ].momentjs_locale.numberFormat;
	}

	this.state.translations.reset();
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
 * Exposes single translation method, which is converted into its respective Jed method.
 * See sibling README
 * @param  {string} original  - the string to translate
 * @param  {string} plural  - the plural string to translate (if applicable), original used as singular
 * @param  {object} options - properties describing translation requirements for given text
 * @return {string|React-components} translated text or an object containing React children that can be inserted into a parent component
 */
I18N.prototype.translate = function() {
	var options, translation, sprintfArgs, errorMethod, optionsString, cacheable;

	options = normalizeTranslateArguments( arguments );

	cacheable = ! options.components;

	if ( cacheable ) {
		optionsString = JSON.stringify( options );

		translation = this.state.translations.get( optionsString );
		if ( translation ) {
			return translation;
		}
	}

	translation = getTranslationFromJed( this.state.jed, options );

	// handle any string substitution
	if ( options.args ) {
		sprintfArgs = ( Array.isArray( options.args ) ) ? options.args.slice( 0 ) : [ options.args ];
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
			throwErrors: this.throwErrors
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
	this.state.translations.reset();
	this.stateObserver.emit( 'change' );
};

I18N.prototype.registerComponentUpdateHook = function( callback ) {
	this.componentUpdateHooks.push( callback );
};

I18N.prototype.registerTranslateHook = function( callback ) {
	this.translateHooks.push( callback );
};

module.exports = new I18N();
module.exports.I18N = I18N;
