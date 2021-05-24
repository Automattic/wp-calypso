/**
 * External dependencies
 */
import globby from 'globby';

export const findAdditionalEntryPoints = async (
	additionalEntryPoints: string[]
): Promise< string[] > => {
	return (
		await Promise.all( additionalEntryPoints.map( ( pattern ) => globby( pattern ) ) )
	 ).flat();
};
