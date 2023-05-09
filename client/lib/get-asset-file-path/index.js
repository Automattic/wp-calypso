import path from 'path';

export default function getAssetFilePath( filePath ) {
	return path.join( __dirname, '..', '..', '..', 'public', filePath );
}
