/**
 * packageExists
 *
 * Check whether the given package exist or not
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname( fileURLToPath( import.meta.url ) );

const packagePath = path.join( __dirname, '../../' );

const packageNames = fs.readdirSync( packagePath );

const packageExists = ( packageName ) => packageNames.includes( packageName );

export default packageExists;
