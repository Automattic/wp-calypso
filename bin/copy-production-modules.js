const fs = require( 'fs' );
const path = require( 'path' );
const rcopy = require( 'recursive-copy' );
const yargs = require( 'yargs' );

const args = yargs
	.usage( 'Usage: $0' )
	.default( 'list', 'build/modules.json' )
	.default( 'dest', 'build' )
	.boolean( 'debug' ).argv;

function debug( message ) {
	args.debug && console.log( message );
}

try {
	debug( 'reading modules from ' + args.list );
	const externalModules = JSON.parse( fs.readFileSync( args.list, 'utf8' ) );
	debug( 'bundle directly requests ' + externalModules.length + ' packages' );
	const shippingPkgList = processPackages( externalModules );
	shipDependencies( shippingPkgList );
} catch ( err ) {
	console.error( err );
	process.exit( 1 );
}

function processPackages( pkgList ) {
	const context = {
		pkgList: [],
		visitedFolders: new Set(),
		folderStack: [ '.' ],
		requiredBy: 'the bundle',
		depth: 0,
	};

	for ( const pkgName of pkgList ) {
		processPackage( pkgName, context );
	}

	return context.pkgList;
}

function processPackage( pkgName, context ) {
	const { pkgList, folderStack, visitedFolders, requiredBy, depth } = context;

	const pkgFolder = folderStack[ 0 ] + '/node_modules/' + pkgName;

	// skip if the folder was already visited
	if ( visitedFolders.has( pkgFolder ) ) {
		return;
	}

	// mark the folder as visited
	visitedFolders.add( pkgFolder );

	// Verify that the package resolves to a directory in `node_modules/`, and that
	// it is not a symlink to a monorepo packages. Such packages couldn't be shipped and
	// must be bundled.
	const pkgRealpath = path.relative( '.', fs.realpathSync( pkgFolder ) );
	if ( ! pkgRealpath.startsWith( 'node_modules/' ) ) {
		throw new Error(
			'package ' + pkgName + ' resolves outside node_modules/, likely a symlink: ' + pkgRealpath
		);
	}

	// If the package is in the top-level folder, add it to the list of packages to ship.
	// Subpackages are already shipped together with the parent.
	if ( folderStack.length === 1 ) {
		const indent = '  '.repeat( depth );
		debug( indent + 'shipping ' + pkgName + ': required by ' + requiredBy );
		pkgList.push( pkgName );
	}

	// read package's package.json
	const pkgJson = JSON.parse( fs.readFileSync( pkgFolder + '/package.json' ) );

	// collect dependencies from various fields
	const depFields = [ 'dependencies', 'peerDependencies', 'optionalDependencies' ];
	const pkgDeps = depFields.flatMap( ( type ) => Object.keys( pkgJson[ type ] || {} ) );
	const optionalPkgDeps = Object.keys( pkgJson.peerDependenciesMeta || [] ).filter(
		( dep ) => pkgJson.peerDependenciesMeta[ dep ].optional === true
	);

	// bail out if package has no dependencies
	if ( ! pkgDeps.length ) {
		return;
	}

	// unshift the package's folder to the folder stack
	const subFolderStack = [ pkgFolder, ...folderStack ];

	// iterate its dependencies
	for ( const depName of pkgDeps ) {
		// Find the dependency in node_modules tree, starting with the package's `node_modules/`
		// subdirectory and going up the directory tree to the root.
		const foundFolderIdx = subFolderStack.findIndex( ( folder ) =>
			fs.existsSync( folder + '/node_modules/' + depName )
		);

		if ( foundFolderIdx === -1 ) {
			if ( optionalPkgDeps.includes( depName ) ) {
				continue;
			}
			throw new Error( 'package not found: ' + depName + ', dependency of ' + pkgFolder );
		}

		// add the dependency to shipping list if eligible and recursively collect its dependencies
		const subContext = {
			...context,
			folderStack: subFolderStack.slice( foundFolderIdx ),
			requiredBy: pkgName,
			depth: depth + 1,
		};
		processPackage( depName, subContext );
	}
}

function shipDependencies( pkgList ) {
	const destDir = path.join( args.dest, 'node_modules' );

	debug( 'copying ' + pkgList.length + ' packages to ' + destDir );

	fs.mkdirSync( destDir, { recursive: true } );
	for ( const pkgName of pkgList ) {
		rcopy( path.join( 'node_modules', pkgName ), path.join( destDir, pkgName ), {
			overwrite: true,
		} );
	}
}
