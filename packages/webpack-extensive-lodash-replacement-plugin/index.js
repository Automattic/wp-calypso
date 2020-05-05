const path = require( 'path' );
const semver = require( 'semver' );

const LODASH_MODULE_NAMES = require( './module-names' );

function createError( message, error = null ) {
	return new Error(
		`[ExtensiveLodashReplacementPlugin] ${ message }${ error ? ` Error: ${ error }` : '' }`
	);
}

function getModuleForPath( moduleResolver, rootPath, packageName ) {
	return new Promise( ( resolve, reject ) => {
		moduleResolver.resolve(
			{},
			rootPath,
			packageName,
			{},
			( error, resource, resourceResolveData ) => {
				if ( error ) {
					reject(
						createError(
							`Could not find module ${ packageName } for import on ${ rootPath }.`,
							error
						)
					);
				}

				resolve( resourceResolveData );
			}
		);
	} );
}

class ExtensiveLodashReplacementPlugin {
	constructor( { baseDir = '.' } = {} ) {
		this.baseDir = path.resolve( baseDir );
	}

	async initBaseLodashData() {
		let baseLodash, baseLodashVersion;

		try {
			baseLodash = await getModuleForPath( this.moduleResolver, this.baseDir, 'lodash' );
		} catch ( error ) {
			throw createError( 'Could not find root `lodash`.' );
		}

		try {
			baseLodashVersion =
				baseLodash && baseLodash.descriptionFileData && baseLodash.descriptionFileData.version;
		} catch ( error ) {
			throw createError( 'Could not determine root `lodash` version.' );
		}

		try {
			const baseLodashES = await getModuleForPath( this.moduleResolver, this.baseDir, 'lodash-es' );
			this.baseLodashESVersion =
				baseLodashES &&
				baseLodashES.descriptionFileData &&
				baseLodashES.descriptionFileData.version;
		} catch ( error ) {
			throw createError( 'Could not find root `lodash-es`.' );
		}

		if ( ! this.baseLodashESVersion ) {
			throw createError( 'Could not determine root `lodash-es` version.' );
		}

		if ( baseLodashVersion !== this.baseLodashESVersion ) {
			throw createError( 'Root `lodash` and `lodash-es` versions do not match.' );
		}
	}

	// Figure out the version for a given import.
	// It follows the node resolution algorithm until it finds the package, returning its version.
	async findRequestedVersion( file, packageName ) {
		const foundResolveData = await getModuleForPath(
			this.moduleResolver,
			path.dirname( file ),
			packageName
		);

		return (
			foundResolveData &&
			foundResolveData.descriptionFileData &&
			foundResolveData.descriptionFileData.version
		);
	}

	// Figure out if the requested Lodash import can be replaced with global lodash-es.
	// It takes the importer's version and the global lodash-es version into account.
	async canBeReplaced( file, packageName ) {
		const importVersion = await this.findRequestedVersion( file, packageName );
		const isVersionMatch =
			importVersion &&
			semver.major( this.baseLodashESVersion ) === semver.major( importVersion ) &&
			semver.gte( this.baseLodashESVersion, importVersion );

		if ( ! isVersionMatch ) {
			const relativePath = path.relative( this.baseDir, file );
			// Output compilation warning.
			this.compilation.warnings.push(
				new Error(
					`${ relativePath }\n  ${ packageName } version ${ importVersion } cannot be replaced by lodash-es version ${ this.baseLodashESVersion }`
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
				LODASH_MODULE_NAMES.forEach( ( casedModule ) => {
					if ( subModule === casedModule.toLowerCase() ) {
						subModule = casedModule;
					}
				} );

				return `lodash-es/${ subModule }`;
			}
		}

		return request;
	}

	async modifyResult( result ) {
		if ( ! result || ! result.contextInfo || ! result.contextInfo.issuer ) {
			return;
		}

		// Wait for initialization, if it's still running.
		await this.init;

		const { request } = result;

		// Replace plain 'lodash' with 'lodash-es'.
		if ( /^lodash$/.test( request ) ) {
			if ( await this.canBeReplaced( result.contextInfo.issuer, 'lodash' ) ) {
				// eslint-disable-next-line require-atomic-updates
				result.request = 'lodash-es';
				return;
			}
		}

		// Replace 'lodash/foo' with 'lodash-es/foo'.
		if ( /^lodash\/(.*)$/.test( request ) ) {
			if ( await this.canBeReplaced( result.contextInfo.issuer, 'lodash' ) ) {
				// eslint-disable-next-line require-atomic-updates
				result.request = request.replace( 'lodash/', 'lodash-es/' );
				return;
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
				LODASH_MODULE_NAMES.forEach( ( casedModule ) => {
					if ( subModule === casedModule.toLowerCase() ) {
						subModule = casedModule;
					}
				} );

				// eslint-disable-next-line require-atomic-updates
				result.request = `lodash-es/${ subModule }`;
				return;
			}
		}

		return;
	}

	apply( compiler ) {
		compiler.hooks.thisCompilation.tap( 'LodashReplacementPlugin', ( compilation ) => {
			this.compilation = compilation;
		} );

		compiler.hooks.normalModuleFactory.tap( 'LodashReplacementPlugin', ( nmf ) => {
			this.moduleResolver = this.moduleResolver || nmf.getResolver( 'normal' );
			this.init = this.init || this.initBaseLodashData();

			nmf.hooks.beforeResolve.tapPromise(
				'LodashReplacementPlugin',
				this.modifyResult.bind( this )
			);
		} );
	}
}

module.exports = ExtensiveLodashReplacementPlugin;
