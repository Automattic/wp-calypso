/**
 * External dependencies
 */
import globby from 'globby';
import { resolve } from 'path';

export const findAdditionalEntryPoints = async (
	additionalEntryPoints: string[]
): Promise< string[] > => {
	return ( await Promise.all( additionalEntryPoints.map( ( pattern ) => globby( pattern ) ) ) )
		.flat()
		.map( ( entry ) => resolve( entry ) );
};
