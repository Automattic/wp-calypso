/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable import/no-nodejs-modules */
const path = require( 'path' );
const semver = require( 'semver' );
const {
	NodeJsInputFileSystem,
	CachedInputFileSystem,
	ResolverFactory,
} = require( 'enhanced-resolve' );

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

function createError( message, error = null ) {
	return new Error(
		`[ExtensiveLodashReplacementPlugin] ${ message }${ error ? ` Error: ${ error }` : '' }`
	);
}

const resolverOptions = {
	fileSystem: new CachedInputFileSystem( new NodeJsInputFileSystem(), 4000 ),
	extensions: [ '.js' ],
	resolveToContext: true,
};

function getModuleForPath( rootPath, packageName ) {
	const moduleResolver = ResolverFactory.createResolver( resolverOptions );

	return new Promise( ( resolve, reject ) => {
		moduleResolver.resolve( {}, rootPath, packageName, {}, ( error, filepath, context ) => {
			if ( error ) {
				reject(
					createError(
						`Could not find module ${ packageName } for import on ${ rootPath }.`,
						error
					)
				);
			}

			resolve( context );
		} );
	} );
}

class ExtensiveLodashReplacementPlugin {
	constructor( baseDir = '.' ) {
		this.baseDir = path.resolve( baseDir );
		this.baseLodashContext = getModuleForPath( this.baseDir, 'lodash' );
		this.baseLodashESVersion = ( async () => {
			const baseLodashES = await getModuleForPath( this.baseDir, 'lodash-es' );
			return (
				baseLodashES && baseLodashES.descriptionFileData && baseLodashES.descriptionFileData.version
			);
		} )();
	}

	// Figure out the version for a given import.
	// It follows the node resolution algorithm until it finds the package, returning its version.
	async findRequestedVersion( file, packageName ) {
		const foundContext = await getModuleForPath( path.dirname( file ), packageName );
		const baseLodashContext = await this.baseLodashContext;

		if ( foundContext.path === baseLodashContext.path ) {
			return await this.baseLodashESVersion;
		}

		return (
			foundContext && foundContext.descriptionFileData && foundContext.descriptionFileData.version
		);
	}

	// Figure out if the requested Lodash import can be replaced with global lodash-es.
	// It takes the importer's version and the global lodash-es version into account.
	async canBeReplaced( file, packageName ) {
		const importVersion = await this.findRequestedVersion( file, packageName );
		const baseLodashESVersion = await this.baseLodashESVersion;
		const isVersionMatch =
			importVersion &&
			baseLodashESVersion &&
			semver.major( baseLodashESVersion ) === semver.major( importVersion ) &&
			semver.gte( baseLodashESVersion, importVersion );

		if ( ! isVersionMatch ) {
			const relativePath = path.relative( this.baseDir, file );
			// Output compilation warning.
			this.compilation.warnings.push(
				new Error(
					`${ relativePath }\n  ${ packageName } version ${ importVersion } cannot be replaced by lodash-es version ${ baseLodashESVersion }`
				)
			);
		}

		return isVersionMatch;
	}

	// Get the modified request
	async getModifiedRequest( result ) {
		const { request } = result;

		if ( ! result.contextInfo || ! result.contextInfo.issuer ) {
			return request;
		}

		// Replace plain 'lodash' with 'lodash-es'.
		if ( /^lodash$/.test( request ) ) {
			if ( await this.canBeReplaced( result.contextInfo.issuer, 'lodash' ) ) {
				return 'lodash-es';
			}
		}

		// Replace 'lodash/foo' with 'lodash-es/foo'.
		if ( /^lodash\/(.*)$/.test( request ) ) {
			if ( await this.canBeReplaced( result.contextInfo.issuer, 'lodash' ) ) {
				return request.replace( 'lodash/', 'lodash-es/' );
			}
		}

		// Replace 'lodash.foo' with 'lodash-es/foo'.
		if ( /^lodash\.(.*)$/.test( request ) ) {
			if ( await this.canBeReplaced( result.contextInfo.issuer, request ) ) {
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
		compiler.hooks.thisCompilation.tap( 'LodashReplacementPlugin', compilation => {
			this.compilation = compilation;
		} );

		compiler.hooks.normalModuleFactory.tap( 'LodashReplacementPlugin', nmf => {
			nmf.hooks.beforeResolve.tapPromise( 'LodashReplacementPlugin', async result => {
				if ( ! result ) return;
				result.request = await this.getModifiedRequest( result );
				return result;
			} );
			nmf.hooks.afterResolve.tapPromise( 'LodashReplacementPlugin', async result => {
				if ( ! result ) return;
				result.request = await this.getModifiedRequest( result );
				return result;
			} );
		} );
	}
}

module.exports = ExtensiveLodashReplacementPlugin;
