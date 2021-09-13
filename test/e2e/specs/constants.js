import path from 'path';

export const TEST_IMAGE_PATH = path.normalize(
	path.join( __dirname, '..', 'image-uploads', 'image0.jpg' )
);
export const TEST_AUDIO_PATH = path.normalize(
	path.join( __dirname, '..', 'image-uploads', 'bees.mp3' )
);
export const UNSUPPORTED_FILE_PATH = path.normalize(
	path.join( __dirname, '..', 'image-uploads', 'unsupported_extension.mkv' )
);
