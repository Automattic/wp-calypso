/**
 * External dependencies
 */
var debug = require( 'debug' )( 'calypso:i18n' ),
	Jed = require( 'jed' ),
	request = require( 'superagent' ),
	tzDetect = require( './timezone' ).timezone,
	moment = require( 'moment-timezone' );

/**
 * Internal dependencies
 */
var config = require( 'config' ),
	numberFormatPHPJS = require( './number-format' ),
	emitter = require( 'lib/mixins/emitter' ),
	interpolateComponents = require( 'lib/interpolate-components' );

/**
 * variables
 */
var componentUpdateHooks = [],
	translateHooks = [],
	i18nState,
	mixin,
	exportMethods;

// i18nState is shared by all i18n usage, including components enhanced with i18n
// as a mixin and when i18n is instantiated as a standalone object.
i18nState = {
	numberFormatSettings: {},
	jed: undefined,
	locale: undefined,
	localeSlug: undefined
};

// add event emitter mixin
emitter( i18nState );

// Because the i18nState object is mixed into a ton of React components,
// we need to bump the number of listeners to infinity and beyond
i18nState.setMaxListeners( 0 );

/**
 * Initialized with a bootstrapped locale, the currentUser's localeSlug, or default if none available
 * @param  {object} bootstrap The bootstrapped locale file
 */
function initialize( bootstrap ) {
	var localeSlugFrom = 'default';
	i18nState.localeSlug = config( 'i18n_default_locale_slug' );

	if ( bootstrap ) {
		if ( typeof bootstrap[ '' ] !== 'undefined' && typeof bootstrap[ '' ].localeSlug !== 'undefined' ) {
			i18nState.localeSlug = bootstrap[ '' ].localeSlug;
		}
		debug( 'Initialized i18n with bootstrapped locale: ' + i18nState.localeSlug );
		setLocale( bootstrap );
	} else {
		debug( 'Initialize i18n with ' + localeSlugFrom + ' localeSlug: ' + i18nState.localeSlug );
		fetchLocale( i18nState.localeSlug );
	}
}

/**
 * Loads locale json file to instantiate Jed instance as `i18nState`, emits 'change' event to notify view to update
 * @param  {string} localeSlug The string that represents this particular locale
 */
function fetchLocale( localeSlug ) {
	var localeJson = '//widgets.wp.com/languages/calypso/' + localeSlug + '.json';

	// If default locale, no need to retrieve translations
	if ( config( 'i18n_default_locale_slug' ) === localeSlug ) {
		i18nState.localeSlug = localeSlug;
		setLocale( {
			'': {}
		} );
		return;
	}

	// Instantiate empty Jed object so we don't block rendering
	// while waiting for the locale file to load.
	// Will result in flash of content, but better than waiting.
	if ( ! i18nState.jed ) {
		setLocale( {
			'': {}
		} );
	}

	request.get( localeJson )
		.end( function( error, response ) {
			if ( error ) {
				console.error( 'Encountered an error loading locale file for ' + localeSlug + '. Falling back to English.' );
				return;
			}
			debug( 'Received new locale file for ' + localeSlug + '.', response.body );
			i18nState.localeSlug = localeSlug;
			setLocale( response.body );
		} );
}

function setLocale( locale ) {
	locale[ '' ].localeSlug = i18nState.localeSlug;
	i18nState.locale = locale;
	buildJedData( locale );
	buildMomentAndNumber( locale );
	i18nState.emit( 'change' );
}

function getLocale() {
	return i18nState.locale;
}

/**
 * Builds Jed data object with a8c locale data and attaches to i18nState closure
 * @param  {object} data locale data
 */
function buildJedData( data ) {
	i18nState.jed = new Jed( {
		locale_data: {
			messages: data
		}
	} );
}

/**
 * Set the user's locale using a localeSlug string
 * @param {string} localeSlug the string that represents the desired locale
 */
function setLocaleSlug( localeSlug ) {
	// Don't fetch if same as current
	if ( localeSlug && i18nState.localeSlug !== localeSlug ) {
		i18nState.localeSlug = localeSlug;
		debug( 'Locale loaded from setLocaleSlug: ' + localeSlug );
		fetchLocale( localeSlug );
	}
}

/**
 * Get the current locale slug.
 * @returns {string} The string representing the currently loaded locale
 **/
function getLocaleSlug() {
	return i18nState.localeSlug;
}

/**
 * Updates moment and numberFormat preferences with settings from locale object
 * @param  {object} data locale data
 */
function buildMomentAndNumber( data ) {
	var momentLocale;
	if ( typeof data[ '' ] === 'undefined' || typeof data[ '' ].momentjs_locale === 'undefined' ) {
		return;
	}
	momentLocale = data[ '' ].momentjs_locale;
	moment.locale( i18nState.localeSlug, momentLocale );
	i18nState.numberFormatSettings = momentLocale.numberFormat;
}

/**
 * Formats numbers using locale settings and/or passed options
 * @param  {String|Number|Int}  number to format (required)
 * @param  {Int|object} options  Number of decimal places or options object (optional)
 * @return {string}         Formatted number as string
 */
function numberFormat( number ) {
	var options = arguments[ 1 ] || {},
		decimals = ( typeof options === 'number' ) ? options : options.decimals || 0,
		decPoint = options.decPoint || i18nState.numberFormatSettings.decimal_point || '.',
		thousandsSep = options.thousandsSep || i18nState.numberFormatSettings.thousands_sep || ',';

	return numberFormatPHPJS( number, decimals, decPoint, thousandsSep );
}

// raise a console warning
function warn() {
	if ( config( 'env' ) === 'production' ) {
		return;
	}
	if ( window && window.console && window.console.warn ) {
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
 * @param  {object} options - object describing translation
 * @return {string}         - the returned translation from Jed
 */
function getTranslationFromJed( options ) {
	var jedMethod = 'gettext',
		jedArgs;

	if ( options.context ) {
		jedMethod = 'p' + jedMethod;
	}

	if ( typeof options.original === 'string' && typeof options.plural === 'string' ) {
		jedMethod = 'n' + jedMethod;
	}

	jedArgs = getJedArgs( jedMethod, options );

	return i18nState.jed[ jedMethod ].apply( i18nState.jed, jedArgs );
}

function registerComponentUpdateHook( callback ) {
	componentUpdateHooks.push( callback );
}

function registerTranslateHook( callback ) {
	translateHooks.push( callback );
}

/* Causes i18n to re-render all translations.
 *
 * This can be necessary if an extension makes changes that i18n is unaware of
 * and needs those changes manifested immediately (e.g. adding an important
 * translation hook, or modifying the behaviour of an existing hook).
 *
 * If at all possible, react components should try to use the more local
 * updateTranslation() function inherited from the mixin.
 */
function reRenderTranslations() {
	debug( 'Re-rendering all translations due to external request' );
	i18nState.emit( 'change' );
}

// The mixin object is injected during startup
mixin = {
	moment: moment,

	numberFormat: numberFormat,

	componentWillMount: function() {
		moment.tz.setDefault( tzDetect() );
	},

	componentDidMount: function() {
		i18nState.on( 'change', this.updateTranslation );
		componentUpdateHooks.forEach( function( hook ) {
			hook();
		} );
	},

	componentDidUpdate: function() {
		componentUpdateHooks.forEach( function( hook ) {
			hook();
		} );
	},

	componentWillUnmount: function() {
		i18nState.off( 'change', this.updateTranslation );
	},

	updateTranslation: function() {
		debug( 'Re-rendering ' + this.constructor.displayName + ' component.' );
		if ( this.isMounted() ) {
			this.forceUpdate();
		}
	},

	/**
	 * Exposes single translation method, which is converted into its respective Jed method.
	 * See sibling README
	 * @param  {string} original  - the string to translate
	 * @param  {string} plural  - the plural string to translate (if applicable), original used as singular
	 * @param  {object} options - properties describing translation requirements for given text
	 * @return {string|React-components} translated text or an object containing React children that can be inserted into a parent component
	 */
	translate: function() {
		var options, translation, sprintfArgs, errorMethod;

		options = normalizeTranslateArguments( arguments );

		translation = getTranslationFromJed( options );

		// handle any string substitution
		if ( options.args ) {
			sprintfArgs = ( Array.isArray( options.args ) ) ? options.args.slice( 0 ) : [ options.args ];
			sprintfArgs.unshift( translation );
			try {
				translation = Jed.sprintf.apply( Jed, sprintfArgs );
			} catch( error ) {
				if ( ! window || ! window.console ) {
					return;
				}
				errorMethod = ( config( 'env' ) === 'development' ) ? 'error' : 'warn';
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
				translation: translation,
				components: options.components,
				throwErrors: ( config( 'env' ) !== 'production' )
			} );
		}

		// run any necessary hooks
		translateHooks.forEach( function( hook ) {
			translation = hook( translation, options );
		} );

		return translation;
	},
};

exportMethods = {
	// The actual mixin injected during startup
	mixin: mixin,
	// API for stand-alone use ( i.e. i18n = require( 'i18n' ) );
	initialize: initialize,
	translate: mixin.translate,
	moment: mixin.moment,
	numberFormat: mixin.numberFormat,
	registerComponentUpdateHook: registerComponentUpdateHook,
	registerTranslateHook: registerTranslateHook,
	getLocale: getLocale,
	setLocale: setLocale,
	reRenderTranslations: reRenderTranslations,
	setLocaleSlug: setLocaleSlug,
	getLocaleSlug: getLocaleSlug
};

// If added as a standalone object, propagate change event
emitter( exportMethods );
i18nState.on( 'change', function() {
	exportMethods.emit( 'change' );
} );

module.exports = exportMethods;

