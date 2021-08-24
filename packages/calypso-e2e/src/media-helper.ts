import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import config from 'config';
import { getTimestamp } from './data-helper';

/**
 * Interface for holding various parts of a filepath.
 */
export interface TestFile {
	fullpath: string; // eg. /usr/home/wp-calypso/test/e2e/image-uploads/image.jpg
	dirname: string; // eg. /usr/home/wp-calypso/test/e2e/image-uploads/
	basename: string; // eg. image.jpg
	filename: string; // eg. image
	extension: string; // eg. .jpg
}

const artifacts: { [ key: string ]: string } = config.get( 'artifacts' );

/**
 * Returns the base asset directory.
 *
 * If the environment variable TEMP_ASSET_PATH is set, this will return a path
 * to the directory. Otherwise, the parent directory of this current file.
 *
 * @returns {string} Absolute path to the directory.
 */
export function getAssetDir(): string {
	return path.resolve( process.env.TEMP_ASSET_PATH || path.join( __dirname, '..' ) );
}

/**
 * Returns the screenshot save directory.
 *
 * If the environment variable SCREENSHOTDIR is set, this will override all configuration
 * values. Otherwise, the default path contained in the configuration file is returned.
 *
 * @returns {string} Absolute path to the directory.
 */
export function getScreenshotDir(): string {
	return path.resolve( getAssetDir(), process.env.SCREENSHOTDIR || artifacts.screenshot );
}

/**
 * Returns the video save directory.
 *
 * If the environment variable VIDEODIR is set, this will override all configuration
 * values. Otherwise, the default path contained in the configuration file is returned.
 *
 * @returns {string} Absolute path to the directory.
 */
export function getVideoDir(): string {
	return path.resolve( getAssetDir(), process.env.VIDEODIR || artifacts.video );
}

/**
 * Creates a temporary test file by cloning a source file under a new name.
 *
 * @param {{[key: string]: string}} param0 Parameter object.
 * @param {string} param0.sourceFileName Basename of the source file to be cloned.
 * @param {string} [param0.testFileName] Basename of the test file to be generated.
 * @returns {Promise<TestFile>} Object implementing the TestFile interface.
 */
export async function createTestFile( {
	sourceFileName,
	testFileName,
}: {
	sourceFileName: string;
	testFileName?: string;
} ): Promise< TestFile > {
	let filename = getTimestamp();
	// If the output `testFileName` is defined, use that as part of the final filename.
	if ( testFileName ) {
		filename += `-${ testFileName }`;
	}

	const extension = sourceFileName.split( '.' ).pop();
	if ( ! extension ) {
		throw new Error( `Extension not found on source file ${ sourceFileName }` );
	}
	const basename = `${ filename }.${ sourceFileName.split( '.' ).pop() }`;
	// Create test files in the same directory as the source file.
	const dirname = path.join( __dirname, '' );
	// Full path on disk of the source file, to be copied and renamed.
	const sourceFilePath = path.join( dirname, sourceFileName );

	const tempDir = await fs.mkdtemp( path.join( os.tmpdir(), 'e2e-' ) );
	const testFilePath = path.join( tempDir, basename );

	await fs.copyFile( sourceFilePath, testFilePath );

	// Return an object implementing the interface.
	return {
		fullpath: testFilePath,
		dirname: dirname,
		basename: basename,
		filename: filename,
		extension: extension,
	};
}

/**
 * Returns the path to a generated temporary JPEG image file.
 *
 * @returns {Promise<TestFile>} Object implementing the TestFile interface.
 */
export async function createTestImage(): Promise< TestFile > {
	return await createTestFile( { sourceFileName: 'image0.jpg' } );
}

/**
 * Returns the path to a generated temporary MP3 audio file.
 *
 * @returns {Promise<TestFile>} Object implementing the TestFile interface.
 */
export async function createTestAudio(): Promise< TestFile > {
	return await createTestFile( { sourceFileName: 'bees.mp3' } );
}

/**
 * Returns the path to an unsupported file.
 *
 * @returns {Promise<TestFile>} Object implementing the TestFile interface.
 */
export async function createUnsupportedFile(): Promise< TestFile > {
	return await createTestFile( { sourceFileName: 'unsupported_extension.mkv' } );
}
