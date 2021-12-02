import path from 'path';

export const TEST_IMAGE_PATH = path.normalize(
	path.join( __dirname, '..', 'image-uploads', 'test-image-01.png' )
);
export const TEST_AUDIO_PATH = path.normalize(
	path.join( __dirname, '..', 'image-uploads', 'test-audio-01.mp3' )
);
export const TEST_UNSUPPORTED_FILE_PATH = path.normalize(
	path.join( __dirname, '..', 'image-uploads', 'test-unsupported-file-01.mkv' )
);
