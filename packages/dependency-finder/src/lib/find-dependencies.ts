/**
 * External dependencies
 */
import dependencyTree from 'dependency-tree';
import { readPackageUpSync } from 'read-pkg-up';
import type { NormalizedReadResult } from 'read-pkg-up';
import type { Tree } from 'dependency-tree';
import path from 'path';
import fs from 'fs';

import { findPackageJsonEntrypoints } from './entrypoints/packagejson.js';
import { findJestEntrypoints } from './entrypoints/jest.js';
import { findAdditionalEntryPoints } from './entrypoints/additional.js';
import { findMissingPackages } from './find-missing.js';

export const findDependencies = async ( {
	pkg,
	monorepoPackages,
	additionalEntryPoints = [],
}: {
	pkg: string;
	monorepoPackages: string[];
	additionalEntryPoints?: string[];
} ): Promise< {
	missing: string[];
	packages: string[];
	modules: string[];
} > => {
	let missing: string[] = [];
	const visited: Tree = {};
	const packages: Set< string > = new Set();
	const modules: Set< string > = new Set();

	const pkgJsonPath = path.resolve( pkg, 'package.json' );
	const entrypoints = await findPackageJsonEntrypoints( { pkgPath: pkg } );
	modules.add( pkgJsonPath );

	const jestTests = await ( async () => {
		try {
			const jestConfigPath = path.join( pkg, 'jest.config.js' );
			fs.accessSync( jestConfigPath );
			modules.add( jestConfigPath );
			return findJestEntrypoints( { jestConfigPath } );
		} catch {
			return [];
		}
	} )();

	const tsConfig = ( () => {
		try {
			const tsConfigPath = path.join( pkg, 'tsconfig.json' );
			fs.accessSync( tsConfigPath );
			modules.add( tsConfigPath );
			return tsConfigPath;
		} catch {
			return null;
		}
	} )();

	const absoluteAdditionalEntryPoints = await findAdditionalEntryPoints( additionalEntryPoints );

	// Handles monorepo and npm results from parsed files.
	const fileFilter = ( path: string ) => {
		const isMonorepo = monorepoPackages.some(
			( monorepoPackage ) => ! path.startsWith( pkg ) && path.startsWith( monorepoPackage )
		);
		const isNodeModules = path.includes( 'node_modules' );

		if ( isMonorepo || isNodeModules ) {
			const { version, name } = ( readPackageUpSync( {
				cwd: path,
			} ) as NormalizedReadResult ).packageJson;
			packages.add( `${ name }@${ version }` );
			return false;
		}

		return true;
	};

	for ( const entrypoint of [ ...entrypoints, ...jestTests, ...absoluteAdditionalEntryPoints ] ) {
		const tree = dependencyTree.toList( {
			filename: entrypoint,
			directory: path.dirname( entrypoint ),
			tsConfig: tsConfig ?? undefined,
			visited,
			filter: fileFilter,
			nonExistent: missing,
		} );
		tree.forEach( ( module ) => modules.add( module ) );
	}

	// Handle missing files which do exist, but are weird enough for dependencyTree to miss.
	const { foundPackages, resolvedFiles } = findMissingPackages( missing );
	resolvedFiles.forEach( fileFilter );
	missing = missing.filter(
		( missingModule ) => ! foundPackages.some( ( foundModule ) => foundModule === missingModule )
	);

	return {
		missing,
		packages: Array.from( packages ).sort(),
		modules: Array.from( modules ).sort(),
	};
};
