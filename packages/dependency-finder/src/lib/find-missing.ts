/**
 * External dependencies
 */
import { resolve, basename, dirname } from 'path';
import { existsSync } from 'fs';

type FoundPackages = {
	foundPackages: Array< string >;
	resolvedFiles: Array< string >;
};

/**
 * Resolves dependencies which dependency-tree has trouble finding. For example,
 * it is unable to parse sass imports such as `~@wordpress/base-styles/mixins`.
 * This format is accepted by webpack to resolve style imports from node_modules,
 * but dependency-tree does not support it. In this case, we translate that to
 * node_modules/@wordpress/base-styles/_mixins.scss, if it exists.
 *
 * @param missingDependencies An array of dependencies that dependencyTree couldn't find.
 * @returns An array of absolute paths to the location of any dependencies that were found.
 */
export function findMissingPackages( missingDependencies: Array< string > ): FoundPackages {
	return missingDependencies.reduce< FoundPackages >(
		( acc, file ) => {
			if ( file.startsWith( '~' ) ) {
				// Without the tilde.
				const correctFile = file.substring( 1 );
				const dirName = dirname( correctFile );
				const fileName = basename( correctFile );

				// Webpack can resolve a few variations of the file, so check them all.
				const fileNameVariations = [
					fileName,
					fileName + '.scss',
					'_' + fileName,
					'_' + fileName + '.scss',
				];

				// Add the first variation which exists to the accumulator.
				for ( const possibleFile of fileNameVariations ) {
					const packagePath = resolve( 'node_modules', dirName, possibleFile );
					if ( existsSync( packagePath ) ) {
						acc.resolvedFiles.push( packagePath );
						acc.foundPackages.push( file );
						break;
					}
				}
			}
			return acc;
		},
		{ foundPackages: [], resolvedFiles: [] }
	);
}
