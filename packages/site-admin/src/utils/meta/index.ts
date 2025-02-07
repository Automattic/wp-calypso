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
 * @returns {Meta} Site admin meta data.
 */
export function getMeta(): Meta {
	return {
		name,
		version,
		description,
	};
}
