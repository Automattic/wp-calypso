/**
 * External dependencies
 */
import path from 'path';

export default function getAssetFilePath( target, filePath ) {
	return path.join( __dirname, '..', '..', '..', 'public', target, filePath );
}
