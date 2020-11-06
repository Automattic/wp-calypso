const { packagesInMonorepo } = require( '../build-tools/lib/monorepo' );

const packages = packagesInMonorepo().map( ( pkg ) => pkg.name );
/**
 * Implements a custom resolver that uses `pkg['calypso:src']` isntead of `pkg.main` for packages from the monorepo.
 *
 * Doc: https://jestjs.io/docs/en/configuration#resolver-string
 *
 * Jest will call this method with the package to be resolved. We'll call back the default resolver but passing
 * an extra `packageFilter`. The default resolver will call `resolve` (https://www.npmjs.com/package/resolve). That
 * library will read `package.json` from the requested module and pass it through `packageFilter` to pre-process it
 * before trying to read the entrypoint.
 *
 * If the requested package _name_ is one of the packages we have under `./packages`, we tell the resolver to use `pkg['calypso:src']`
 * to read the main file.
 *
 * @param {string} request The package being requested
 * @param {*} options Options for the resolver
 */
module.exports = ( request, options ) => {
	return options.defaultResolver( request, {
		...options,
		packageFilter: ( pkg ) => {
			//TODO: when Jest moves to resolver v2, this method will receive a second argument that points to the real package file (ie: no symlink)
			//We can use it to determine if the package file is within the repo
			if ( packages.includes( pkg.name ) ) {
				return {
					...pkg,
					main: pkg[ 'calypso:src' ] || pkg.module || pkg.main,
				};
			}
			return pkg;
		},
	} );
};
