/**
 * Internal dependencies
 */
import { name, version, description } from '../../../package.json';

type Meta = {
	name: string;
	version: string;
	description: string;
};

/**
 * Get the site admin meta data.
 * @example
 * ```jsx
 * import { getMeta } from '@automattic/site-admin'
 *
 * const meta = getMeta()
 * console.log(`The package version is ${meta.version}`);
 * ```
 * @returns {Meta} Site admin meta data.
 */
export function getMeta(): Meta {
	return {
		name,
		version,
		description,
	};
}
