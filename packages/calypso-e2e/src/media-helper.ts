import { constants } from 'fs';
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
 * @param {string} sourcePath Full path on disk of the source file.
 * @param {{[key: string]: string}} param0 Parameter object.
 * @param {string} [param0.postfix] Additional suffix to be used for the file.
 * @returns {Promise<TestFile>} Object implementing the TestFile interface.
 * @throws {Error} If source file was not found, or source file did not contain an extension.
 */
export async function createTestFile(
	sourcePath: string,
	{
		postfix,
	}: {
		postfix?: string;
	} = {}
): Promise< TestFile > {
	// Check whether the source file maps to a file.
	// Note, if sourcePath is not found use console.error instead of throw:
	// https://github.com/facebook/jest/issues/8688
	try {
		await fs.access( sourcePath );
	} catch {
		throw new Error( `Source file ${ sourcePath } not found on disk.` );
	}

	// Obtain the file extension.
	const extension = path.extname( sourcePath );
	if ( ! extension ) {
		throw new Error( `Extension not found on source file ${ sourcePath }` );
	}

	// Generate a filename using current timestamp and a pseudo-randomly generated integer.
	let filename = getTimestamp();
	// If `postfix` is defined, use that as part of the final filename.
	if ( postfix ) {
		filename += `-${ postfix }`;
	}

	// Obtain the basename (filename with extension)
	const basename = `${ filename }${ extension }`;

	const tempDir = await fs.mkdtemp( path.join( os.tmpdir(), 'e2e' ) );
	const targetPath = path.join( tempDir, basename );

	await fs.copyFile( sourcePath, targetPath, constants.COPYFILE_EXCL );

	// Return an object implementing the interface.
	return {
		fullpath: targetPath,
		dirname: tempDir,
		basename: basename,
		filename: filename,
		extension: extension,
	};
}
