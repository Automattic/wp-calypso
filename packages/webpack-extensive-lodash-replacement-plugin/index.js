/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable import/no-nodejs-modules */
const path = require( 'path' );
const findPackageJson = require( 'find-package-json' );
const fs = require( 'fs' );
const semver = require( 'semver' );

// List of all known lodash module names.
// Used for normalizing names to avoid code duplication.
// Note: this list should be kept up-to-date with new lodash versions.
const LODASH_MODULE_NAMES = [
	'add',
	'after',
	'ary',
	'assign',
	'assignIn',
	'assignInWith',
	'assignWith',
	'at',
	'attempt',
	'before',
	'bind',
	'bindAll',
	'bindKey',
	'camelCase',
	'capitalize',
	'castArray',
	'ceil',
	'chain',
	'chunk',
	'clamp',
	'clone',
	'cloneDeep',
	'cloneDeepWith',
	'cloneWith',
	'commit',
	'compact',
	'concat',
	'cond',
	'conforms',
	'conformsTo',
	'constant',
	'countBy',
	'create',
	'curry',
	'curryRight',
	'debounce',
	'deburr',
	'defaultTo',
	'defaults',
	'defaultsDeep',
	'defer',
	'delay',
	'difference',
	'differenceBy',
	'differenceWith',
	'divide',
	'drop',
	'dropRight',
	'dropRightWhile',
	'dropWhile',
	'each',
	'eachRight',
	'endsWith',
	'entries',
	'entriesIn',
	'eq',
	'escape',
	'escapeRegExp',
	'every',
	'extend',
	'extendWith',
	'fill',
	'filter',
	'find',
	'findIndex',
	'findKey',
	'findLast',
	'findLastIndex',
	'findLastKey',
	'first',
	'flatMap',
	'flatMapDeep',
	'flatMapDepth',
	'flatten',
	'flattenDeep',
	'flattenDepth',
	'flip',
	'floor',
	'flow',
	'flowRight',
	'forEach',
	'forEachRight',
	'forIn',
	'forInRight',
	'forOwn',
	'forOwnRight',
	'fromPairs',
	'functions',
	'functionsIn',
	'get',
	'groupBy',
	'gt',
	'gte',
	'has',
	'hasIn',
	'head',
	'identity',
	'inRange',
	'includes',
	'indexOf',
	'initial',
	'intersection',
	'intersectionBy',
	'intersectionWith',
	'invert',
	'invertBy',
	'invoke',
	'invokeMap',
	'isArguments',
	'isArray',
	'isArrayBuffer',
	'isArrayLike',
	'isArrayLikeObject',
	'isBoolean',
	'isBuffer',
	'isDate',
	'isElement',
	'isEmpty',
	'isEqual',
	'isEqualWith',
	'isError',
	'isFinite',
	'isFunction',
	'isInteger',
	'isLength',
	'isMap',
	'isMatch',
	'isMatchWith',
	'isNaN',
	'isNative',
	'isNil',
	'isNull',
	'isNumber',
	'isObject',
	'isObjectLike',
	'isPlainObject',
	'isRegExp',
	'isSafeInteger',
	'isSet',
	'isString',
	'isSymbol',
	'isTypedArray',
	'isUndefined',
	'isWeakMap',
	'isWeakSet',
	'iteratee',
	'join',
	'kebabCase',
	'keyBy',
	'keys',
	'keysIn',
	'last',
	'lastIndexOf',
	'lodash',
	'lowerCase',
	'lowerFirst',
	'lt',
	'lte',
	'map',
	'mapKeys',
	'mapValues',
	'matches',
	'matchesProperty',
	'max',
	'maxBy',
	'mean',
	'meanBy',
	'memoize',
	'merge',
	'mergeWith',
	'method',
	'methodOf',
	'min',
	'minBy',
	'mixin',
	'multiply',
	'negate',
	'next',
	'noop',
	'now',
	'nth',
	'nthArg',
	'omit',
	'omitBy',
	'once',
	'orderBy',
	'over',
	'overArgs',
	'overEvery',
	'overSome',
	'pad',
	'padEnd',
	'padStart',
	'parseInt',
	'partial',
	'partialRight',
	'partition',
	'pick',
	'pickBy',
	'plant',
	'property',
	'propertyOf',
	'pull',
	'pullAll',
	'pullAllBy',
	'pullAllWith',
	'pullAt',
	'random',
	'range',
	'rangeRight',
	'rearg',
	'reduce',
	'reduceRight',
	'reject',
	'remove',
	'repeat',
	'replace',
	'rest',
	'result',
	'reverse',
	'round',
	'sample',
	'sampleSize',
	'set',
	'setWith',
	'shuffle',
	'size',
	'slice',
	'snakeCase',
	'some',
	'sortBy',
	'sortedIndex',
	'sortedIndexBy',
	'sortedIndexOf',
	'sortedLastIndex',
	'sortedLastIndexBy',
	'sortedLastIndexOf',
	'sortedUniq',
	'sortedUniqBy',
	'split',
	'spread',
	'startCase',
	'startsWith',
	'stubArray',
	'stubFalse',
	'stubObject',
	'stubString',
	'stubTrue',
	'subtract',
	'sum',
	'sumBy',
	'tail',
	'take',
	'takeRight',
	'takeRightWhile',
	'takeWhile',
	'tap',
	'template',
	'templateSettings',
	'throttle',
	'thru',
	'times',
	'toArray',
	'toFinite',
	'toInteger',
	'toIterator',
	'toJSON',
	'toLength',
	'toLower',
	'toNumber',
	'toPairs',
	'toPairsIn',
	'toPath',
	'toPlainObject',
	'toSafeInteger',
	'toString',
	'toUpper',
	'transform',
	'trim',
	'trimEnd',
	'trimStart',
	'truncate',
	'unary',
	'unescape',
	'union',
	'unionBy',
	'unionWith',
	'uniq',
	'uniqBy',
	'uniqWith',
	'uniqueId',
	'unset',
	'unzip',
	'unzipWith',
	'update',
	'updateWith',
	'upperCase',
	'upperFirst',
	'value',
	'valueOf',
	'values',
	'valuesIn',
	'without',
	'words',
	'wrap',
	'wrapperAt',
	'wrapperChain',
	'wrapperCommit',
	'wrapperLodash',
	'wrapperNext',
	'wrapperPlant',
	'wrapperReverse',
	'wrapperToIterator',
	'wrapperValue',
	'xor',
	'xorBy',
	'xorWith',
	'zip',
	'zipObject',
	'zipObjectDeep',
	'zipWith',
];

function throwError( message, error = null ) {
	throw new Error(
		`[ExtensiveLodashReplacementPlugin] ${ message }${ error ? ' Error: ' : '' }${ error }`
	);
}

class ExtensiveLodashReplacementPlugin {
	constructor( baseFile = './package.json' ) {
		this.baseFile = path.resolve( baseFile );
		let data;

		try {
			data = fs.readFileSync( this.baseFile );
		} catch ( error ) {
			throwError( 'Could not read root package.json.', error );
		}

		try {
			const packageJson = JSON.parse( data );
			this.lodashVersion =
				packageJson && packageJson.dependencies && packageJson.dependencies[ 'lodash-es' ];
		} catch ( error ) {
			throwError( 'Could not parse root package.json.', error );
		}

		if ( ! this.lodashVersion ) {
			throwError( 'No lodash-es dependency in root package.json.' );
		}

		if ( ! semver.valid( this.lodashVersion ) ) {
			throwError( `Invalid root package.json lodash-es version: ${ this.lodashVersion }.` );
		}
	}

	// Figure out the requested Lodash version range for a given import.
	// It looks at the file with the import and traverses upwards, until it finds a package.json file
	// with the requested dependency. It returns this range.
	findRequestedLodashRange( file, packageName ) {
		const finder = findPackageJson( path.dirname( file ) );
		let version;

		try {
			while ( ! version ) {
				const found = finder.next();

				if ( found.filename === this.baseFile ) {
					return this.lodashVersion;
				}

				const contents = found && found.value;
				version = contents && contents.dependencies && contents.dependencies[ packageName ];
			}
		} catch ( error ) {
			throwError( `Could not find requested range for import on ${ file }.`, error );
		}

		return version;
	}

	// Figure out if the requested Lodash import can be replaced with global lodash-es.
	// It takes the importer's lodash version range and the global lodash-es version into account.
	canBeReplaced( file, packageName ) {
		const requestedVersion = this.findRequestedLodashRange( file, packageName );
		return requestedVersion && semver.satisfies( this.lodashVersion, requestedVersion );
	}

	// Get the modified request
	getModifiedRequest( result ) {
		const { request } = result;

		if ( ! result.contextInfo || ! result.contextInfo.issuer ) {
			return request;
		}

		// Replace plain 'lodash' with 'lodash-es'.
		if ( /^lodash$/.test( request ) ) {
			if ( this.canBeReplaced( result.contextInfo.issuer, 'lodash' ) ) {
				return 'lodash-es';
			}
		}

		// Replace 'lodash/foo' with 'lodash-es/foo'.
		if ( /^lodash\/(.*)$/.test( request ) ) {
			if ( this.canBeReplaced( result.contextInfo.issuer, 'lodash' ) ) {
				return request.replace( 'lodash/', 'lodash-es/' );
			}
		}

		// Replace 'lodash.foo' with 'lodash-es/foo'.
		if ( /^lodash\.(.*)$/.test( request ) ) {
			if ( this.canBeReplaced( result.contextInfo.issuer, request ) ) {
				const match = /^lodash\.(.*)$/.exec( request );
				let subModule = match[ 1 ];

				// Normalize module names.
				// This avoids code duplication due to module name case differences
				// (e.g. 'camelcase' vs 'camelCase').
				LODASH_MODULE_NAMES.forEach( casedModule => {
					if ( subModule === casedModule.toLowerCase() ) {
						subModule = casedModule;
					}
				} );

				return `lodash-es/${ subModule }`;
			}
		}

		return request;
	}

	apply( compiler ) {
		compiler.hooks.normalModuleFactory.tap( 'LodashReplacementPlugin', nmf => {
			nmf.hooks.beforeResolve.tap( 'LodashReplacementPlugin', result => {
				if ( ! result ) return;
				result.request = this.getModifiedRequest( result );
				return result;
			} );
			nmf.hooks.afterResolve.tap( 'LodashReplacementPlugin', result => {
				if ( ! result ) return;
				result.request = this.getModifiedRequest( result );
				return result;
			} );
		} );
	}
}

module.exports = ExtensiveLodashReplacementPlugin;
