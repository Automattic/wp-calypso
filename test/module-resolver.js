const { packagesInMonorepo } = require( '../build-tools/lib/monorepo' );

const packages = packagesInMonorepo().map( ( pkg ) => pkg.name );
/**
 * Implements a custom resolver for Jest.
 *
 * If the package to be resolved is outside `./packages`, the resolver won't change anything (i.e. Jest will read the main file from `pkg.main`).
 * If the package is in `./packages` it will tell Jest to resolve from these fields in this order (if they are present):
 *
 *   1) `calypso:src`: For JavaScript packages this points to the _untranspiled_ source code (usually `./src/index.js`). This allows us to
 *      skip any package transpilation before it can be used by Webpack or Jest, saving some developer time.
 *   2) `module`: This points to the ESM transpilation of the package (usually `./dist/esm`). For TypeScript packages this is populated when
 *      running `yarn prepare`, which happens as a `postinstall` hook.
 *   3) `main`: This is the default, it points to a CJS transpilation (usually `./dist/cjs`). This is _not_ automatically populated and therefore
 *      not safe to use for Jest as it probably points to a file that doesn't exist. This is only populated when the package is packed when it is
 *      about to be published in the NPM repository.
 *
 * Doc: https://jestjs.io/docs/en/configuration#resolver-string
 *
 * How it works:
 *
 * Jest will call this method with the package to be resolved (`request`). We'll call back the default resolver (`options.defaultResolver`)
 * but passing an extra `packageFilter`. The default resolver is an instance of `resolve` (https://www.npmjs.com/package/resolve), which will
 * call `packageFilter` to pre-process `package.json` content before sending it back to Jest. We change `pkg.main` to point to `calypso:src`,
 * `module` or `main`, depending on which one is present.
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
