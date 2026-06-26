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
	'escapeRegExp',
	'once',
	'isError',
	'random',
	'range',
	'truncate',
	'flow',
	'defaults',
	'set',
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
const ISNUMBER_MESSAGE = "Please use `typeof value === 'number'` instead of lodash `isNumber`.";
const FINDKEY_MESSAGE =
	'Please use `Object.keys( obj ).find( ( key ) => … )` instead of lodash `findKey`.';
const FINDINDEX_MESSAGE =
	'Please use native `array.findIndex( ( item ) => … )` instead of lodash `findIndex`.';
const CLONE_MESSAGE =
	'Please use a spread copy (`{ ...obj }` / `[ ...arr ]`) instead of lodash `clone`.';
const CLONE_DEEP_MESSAGE =
	'Please use native `structuredClone` for plain serializable data instead of lodash `cloneDeep`. ' +
	'For object graphs that contain functions, class instances, or symbol keys, write a small local clone.';
const PROPERTY_MESSAGE =
	'Please use an arrow function (`( obj ) => obj.key`) instead of lodash `property`.';
// The js-utils maxBy/minBy rank by numeric iteratee values only — not lodash's
// full string/symbol comparison or iteratee shorthands.
const EXTREMUM_MESSAGE =
	'Please use `maxBy`/`minBy` from `@automattic/js-utils` for numeric rankings. ' +
	'For non-numeric comparisons or iteratee shorthands, write an explicit reducer.';
// The js-utils partition requires a function predicate — not lodash's iteratee
// shorthands (string / object / array).
const PARTITION_MESSAGE =
	'Please use `partition` from `@automattic/js-utils` with a function predicate. ' +
	'It does not support lodash iteratee shorthands — expand those to a predicate function.';
// The js-utils sortBy/orderBy support function and property-path iteratees
// (names, indices, dotted/bracket paths, path arrays) but not lodash's
// object-match shorthand.
const SORT_MESSAGE =
	'Please use `sortBy`/`orderBy` from `@automattic/js-utils`. They support function and ' +
	'property-path iteratees (and arrays of those) but not lodash object-match shorthands.';
const REJECT_MESSAGE =
	'Please use native `array.filter( ( item ) => ! … )` instead of lodash `reject` ' +
	'(expand object-match shorthands to a predicate, and guard nullable collections with `?? []`).';
const CONCAT_MESSAGE =
	'Please use native `array.concat( … )` (or `[].concat( ...arrays )`) instead of lodash `concat`.';
const REDUCE_MESSAGE =
	'Please use native `array.reduce()` (or `Object.entries( obj ).reduce()` to fold an object) ' +
	'instead of lodash `reduce`. Guard nullable collections with `?? []` / `?? {}`.';
const FIND_MESSAGE =
	'Please use native `array.find( ( item ) => … )` (or `Object.values( obj ).find( … )` for objects) ' +
	'instead of lodash `find`. Expand iteratee shorthands to a predicate and guard nullable collections with `?? []`.';
const FINDLAST_MESSAGE =
	'Please use native `array.findLast( ( item ) => … )` instead of lodash `findLast`.';
const HAS_MESSAGE =
	'Please use native `Object.hasOwn( obj, key )` instead of lodash `has` for single-key checks ' +
	'(expand dotted-path checks manually with optional chaining).';
const XOR_MESSAGE =
	'Please compute the symmetric difference natively, e.g. ' +
	'`Array.from( new Set( [ ...a, ...b ] ) ).filter( ( item ) => a.includes( item ) !== b.includes( item ) )`, ' +
	'instead of lodash `xor` (the Set dedupes to match lodash; you can drop it when the inputs are known unique).';

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
	{ name: 'lodash', importNames: [ 'isNumber' ], message: ISNUMBER_MESSAGE },
	{ name: 'lodash', importNames: [ 'findKey' ], message: FINDKEY_MESSAGE },
	{ name: 'lodash', importNames: [ 'findIndex' ], message: FINDINDEX_MESSAGE },
	{ name: 'lodash', importNames: [ 'clone' ], message: CLONE_MESSAGE },
	{ name: 'lodash', importNames: [ 'cloneDeep' ], message: CLONE_DEEP_MESSAGE },
	{ name: 'lodash', importNames: [ 'property' ], message: PROPERTY_MESSAGE },
	{ name: 'lodash', importNames: [ 'maxBy', 'minBy' ], message: EXTREMUM_MESSAGE },
	{ name: 'lodash', importNames: [ 'partition' ], message: PARTITION_MESSAGE },
	{ name: 'lodash', importNames: [ 'sortBy', 'orderBy' ], message: SORT_MESSAGE },
	{ name: 'lodash', importNames: [ 'reject' ], message: REJECT_MESSAGE },
	{ name: 'lodash', importNames: [ 'concat' ], message: CONCAT_MESSAGE },
	{ name: 'lodash', importNames: [ 'reduce' ], message: REDUCE_MESSAGE },
	{ name: 'lodash', importNames: [ 'find' ], message: FIND_MESSAGE },
	{ name: 'lodash', importNames: [ 'findLast' ], message: FINDLAST_MESSAGE },
	{ name: 'lodash', importNames: [ 'has' ], message: HAS_MESSAGE },
	{ name: 'lodash', importNames: [ 'xor' ], message: XOR_MESSAGE },
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
	{ group: [ 'lodash/isNumber' ], message: ISNUMBER_MESSAGE },
	{ group: [ 'lodash/findKey' ], message: FINDKEY_MESSAGE },
	{ group: [ 'lodash/findIndex' ], message: FINDINDEX_MESSAGE },
	{ group: [ 'lodash/clone' ], message: CLONE_MESSAGE },
	{ group: [ 'lodash/cloneDeep' ], message: CLONE_DEEP_MESSAGE },
	{ group: [ 'lodash/property' ], message: PROPERTY_MESSAGE },
	{ group: [ 'lodash/maxBy', 'lodash/minBy' ], message: EXTREMUM_MESSAGE },
	{ group: [ 'lodash/partition' ], message: PARTITION_MESSAGE },
	{ group: [ 'lodash/sortBy', 'lodash/orderBy' ], message: SORT_MESSAGE },
	{ group: [ 'lodash/reject' ], message: REJECT_MESSAGE },
	{ group: [ 'lodash/concat' ], message: CONCAT_MESSAGE },
	{ group: [ 'lodash/reduce' ], message: REDUCE_MESSAGE },
	{ group: [ 'lodash/find' ], message: FIND_MESSAGE },
	{ group: [ 'lodash/findLast' ], message: FINDLAST_MESSAGE },
	{ group: [ 'lodash/has' ], message: HAS_MESSAGE },
	{ group: [ 'lodash/xor' ], message: XOR_MESSAGE },
];

module.exports = { paths, patterns };
