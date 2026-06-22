/**
 * Shared `no-restricted-imports` entries for the incremental lodash removal.
 *
 * Imported by every config that declares a `no-restricted-imports` rule (the
 * root config and the overrides that replace, rather than merge with, it) so the
 * guard stays identical everywhere. Replacements live in `@automattic/js-utils`,
 * or are native array methods.
 */

const JS_UTILS_NAMES = [
	'keyBy',
	'shuffle',
	'uniqBy',
	'times',
	'pick',
	'omit',
	'mapValues',
	'pickBy',
	'omitBy',
	'groupBy',
	'mapKeys',
	'capitalize',
];

// The js-utils case converters cover ASCII identifiers/keys, not lodash's full
// Unicode/deburr behavior, so they get their own message.
const CASE_NAMES = [ 'camelCase', 'snakeCase', 'kebabCase' ];

// `@wordpress/compose` ships drop-in, lodash-derived debounce/throttle.
const COMPOSE_NAMES = [ 'debounce', 'throttle' ];

const JS_UTILS_MESSAGE = 'Please use the equivalent from `@automattic/js-utils` instead.';
const CASE_MESSAGE =
	'Please use the equivalent from `@automattic/js-utils` instead — it covers ASCII identifiers/keys, not free-form Unicode text.';
const COMPOSE_MESSAGE = 'Please use the equivalent from `@wordpress/compose` instead.';
const COMPACT_MESSAGE = 'Please use `array.filter( Boolean )` instead of lodash `compact`.';
const FLATTEN_MESSAGE = 'Please use native `array.flatMap()` / `array.flat()` instead.';
const DEFER_MESSAGE = 'Please use native `setTimeout( fn, 0 )` instead of lodash `defer`.';
const DELAY_MESSAGE = 'Please use native `setTimeout( fn, wait )` instead of lodash `delay`.';
const WITHOUT_MESSAGE =
	'Please use native `array.filter( ( item ) => item !== value )` instead of lodash `without`.';
const DIFFERENCE_MESSAGE =
	'Please use native `array.filter( ( item ) => ! other.includes( item ) )` instead of lodash `difference`.';
const ISEQUAL_MESSAGE = 'Please use `fast-deep-equal/es6` instead of lodash `isEqual`.';
const INTERSECTION_MESSAGE =
	'Please use `array.some( ( item ) => other.includes( item ) )` for a boolean check, or ' +
	'`Array.from( new Set( array ) ).filter( ( item ) => other.includes( item ) )` to dedupe like lodash `intersection`.';
const NOOP_MESSAGE = 'Please use a local `const noop = () => {};` instead of lodash `noop`.';
const INCLUDES_MESSAGE =
	'Please use native `array.includes( value )` / `string.includes( substring )` instead of lodash ' +
	'`includes`. Guard possibly-undefined collections (`value?.includes( … )`), and use ' +
	'`Object.values( obj ).includes( value )` for object collections.';

const paths = [
	{ name: 'lodash', importNames: JS_UTILS_NAMES, message: JS_UTILS_MESSAGE },
	{ name: 'lodash', importNames: CASE_NAMES, message: CASE_MESSAGE },
	{ name: 'lodash', importNames: COMPOSE_NAMES, message: COMPOSE_MESSAGE },
	{ name: 'lodash', importNames: [ 'compact' ], message: COMPACT_MESSAGE },
	{ name: 'lodash', importNames: [ 'flatMap', 'flatten' ], message: FLATTEN_MESSAGE },
	{ name: 'lodash', importNames: [ 'defer' ], message: DEFER_MESSAGE },
	{ name: 'lodash', importNames: [ 'delay' ], message: DELAY_MESSAGE },
	{ name: 'lodash', importNames: [ 'without' ], message: WITHOUT_MESSAGE },
	{ name: 'lodash', importNames: [ 'difference' ], message: DIFFERENCE_MESSAGE },
	{ name: 'lodash', importNames: [ 'isEqual' ], message: ISEQUAL_MESSAGE },
	{ name: 'lodash', importNames: [ 'intersection' ], message: INTERSECTION_MESSAGE },
	{ name: 'lodash', importNames: [ 'noop' ], message: NOOP_MESSAGE },
	{ name: 'lodash', importNames: [ 'includes' ], message: INCLUDES_MESSAGE },
];

// Deep `lodash/<fn>` imports bypass the named-import paths above.
const patterns = [
	{ group: JS_UTILS_NAMES.map( ( name ) => `lodash/${ name }` ), message: JS_UTILS_MESSAGE },
	{ group: CASE_NAMES.map( ( name ) => `lodash/${ name }` ), message: CASE_MESSAGE },
	{ group: COMPOSE_NAMES.map( ( name ) => `lodash/${ name }` ), message: COMPOSE_MESSAGE },
	{ group: [ 'lodash/compact' ], message: COMPACT_MESSAGE },
	{ group: [ 'lodash/flatMap', 'lodash/flatten' ], message: FLATTEN_MESSAGE },
	{ group: [ 'lodash/defer' ], message: DEFER_MESSAGE },
	{ group: [ 'lodash/delay' ], message: DELAY_MESSAGE },
	{ group: [ 'lodash/without' ], message: WITHOUT_MESSAGE },
	{ group: [ 'lodash/difference' ], message: DIFFERENCE_MESSAGE },
	{ group: [ 'lodash/isEqual' ], message: ISEQUAL_MESSAGE },
	{ group: [ 'lodash/intersection' ], message: INTERSECTION_MESSAGE },
	{ group: [ 'lodash/noop' ], message: NOOP_MESSAGE },
	{ group: [ 'lodash/includes' ], message: INCLUDES_MESSAGE },
];

module.exports = { paths, patterns };
