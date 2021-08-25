import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import config from 'config';
import { getTimestamp } from './data-helper';

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
 * Given a full path to file on disk, remove the file.
 *
 * @param {string} filePath Full path on disk.
 * @returns {Promise< void >} No return value.
 */
export async function deleteFile( filePath: string ): Promise< void > {
	await fs.unlink( filePath );
}

/**
 * Creates a temporary test file by cloning a source file under a new name.
 *
 * @param {{[key: string]: string}} param0 Parameter object.
 * @param {string} param0.sourceFileName Basename of the source file to be cloned.
 * @param {string} [param0.testFileName] Basename of the test file to be generated.
 * @returns {Promise<string>} Full path to the generated test file.
 */
export async function createTestFile( {
	sourceFileName,
	testFileName,
}: {
	sourceFileName: string;
	testFileName?: string;
} ): Promise< string > {
	let fileName = getTimestamp();
	// If the output `testFileName` is defined, use that as part of the final filename.
	if ( testFileName ) {
		fileName += `-${ testFileName }`;
	}

	// Reassign the variable with the final name to be used, including the extension.
	fileName = `${ fileName }.${ sourceFileName.split( '.' ).pop() }`;

	const sourceFileDir = path.join( __dirname, '../../../../../test/e2e/image-uploads/' );
	const sourceFilePath = path.join( sourceFileDir, sourceFileName );

	const tempDir = await fs.mkdtemp( path.join( os.tmpdir(), 'e2e-' ) );
	const testFilePath = path.join( tempDir, fileName );

	await fs.copyFile( sourceFilePath, testFilePath );

	return testFilePath;
}

/**
 * Returns the path to a generated temporary JPEG image file.
 *
 * @returns {Promise<string>} Full path on disk to the generated test file.
 */
export async function createTestImage(): Promise< string > {
	return await createTestFile( { sourceFileName: 'image0.jpg' } );
}

/**
 * Returns the path to a generated temporary MP3 audio file.
 *
 * @returns {string} Full path on disk to the generated test file.
 */
export async function createTestAudio(): Promise< string > {
	return await createTestFile( { sourceFileName: 'bees.mp3' } );
}

/**
 * Returns the path to an unsupported file.
 *
 * @returns {string} Full path on disk to the generated test file.
 */
export async function createInvalidFile(): Promise< string > {
	return await createTestFile( { sourceFileName: 'unsupported_extension.mkv' } );
}
