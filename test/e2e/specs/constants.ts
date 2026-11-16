import path from 'path';

export const TEST_FILES_FOLDER_PATH = path.join( __dirname, '..', 'image-uploads' );
export const TEST_IMAGE_PATH = path.join( TEST_FILES_FOLDER_PATH, 'test-image-01.webp' );
export const ALT_TEST_IMAGE_PATH = path.join( TEST_FILES_FOLDER_PATH, 'test-image-02.webp' );
export const TEST_AUDIO_PATH = path.join( TEST_FILES_FOLDER_PATH, 'test-audio-01.mp3' );
export const TEST_UNSUPPORTED_FILE_PATH = path.join(
	TEST_FILES_FOLDER_PATH,
	'test-unsupported-file-01.mkv'
);
export const TEST_VIDEO_PATH = path.join( TEST_FILES_FOLDER_PATH, 'test-video-01.mp4' );
// Made in image-uploads/ from test-image-01.webp, large enough to be given sub-sizes and a srcset:
//   cwebp -resize 1280 1280 test-image-01.webp -o test-image-ai-marker.webp
//   dwebp -resize 1280 1280 test-image-01.webp -o test-image-ai-marker.png
//   exiftool -overwrite_original -XMP-iptcExt:DigitalSourceType=http://cv.iptc.org/newscodes/digitalsourcetype/trainedAlgorithmicMedia test-image-ai-marker.webp test-image-ai-marker.png
export const TEST_AI_MARKER_IMAGE_PATHS = [
	path.join( TEST_FILES_FOLDER_PATH, 'test-image-ai-marker.webp' ),
	path.join( TEST_FILES_FOLDER_PATH, 'test-image-ai-marker.png' ),
];
