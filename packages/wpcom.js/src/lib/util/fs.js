/**
 * External dependencies
 */
import fs from 'fs';

export function createReadStream( ...args ) {
	return fs.createReadStream( ...args );
}
