/**
 * Internal dependencies
 */
import fs from 'fs';
import path from 'path';

const extensions = fs.readdirSync( __dirname )
	.filter( node => fs.statSync( path.join( __dirname, node ) ).isDirectory() );

export default extensions;
