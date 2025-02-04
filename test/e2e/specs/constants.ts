import path from 'path';

export const TEST_FILES_FOLDER_PATH = path.join( __dirname, '..', 'image-uploads' );
export const TEST_IMAGE_PATH = path.join( TEST_FILES_FOLDER_PATH, 'test-image-01.png' );
export const ALT_TEST_IMAGE_PATH = path.join( TEST_FILES_FOLDER_PATH, 'test-image-02.png' );
export const TEST_AUDIO_PATH = path.join( TEST_FILES_FOLDER_PATH, 'test-audio-01.mp3' );
export const TEST_UNSUPPORTED_FILE_PATH = path.join(
	TEST_FILES_FOLDER_PATH,
	'test-unsupported-file-01.mkv'
);
export const TEST_VIDEO_PATH = path.join( TEST_FILES_FOLDER_PATH, 'test-video-01.mp4' );
