import { constants } from 'fs';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import { getTimestamp } from './data-helper';
import type { TestFile } from './types/media-helper.types';

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
