// eslint-disable-next-line import/no-nodejs-modules
import fs from 'fs';

export function createReadStream( ...args ) {
	return fs.createReadStream( ...args );
}
