/**
 * Browser dependencies
 */
const { createObjectURL, revokeObjectURL } = window.URL;

const cache = {};

/**
 * Create a blob URL from a file.
 *
 * @param {File} file The file to create a blob URL for.
 *
 * @return {string} The blob URL.
 */
export function createBlobURL( file ) {
	const url = createObjectURL( file );

	cache[ url ] = file;

	return url;
}

/**
 * Retrieve a file based on a blob URL. The file must have been created by
 * `createBlobURL` and not removed by `revokeBlobURL`, otherwise it will return
 * `undefined`.
 *
 * @param {string} url The blob URL.
 *
 * @return {?File} The file for the blob URL.
 */
export function getBlobByURL( url ) {
	return cache[ url ];
}

/**
 * Remove the resource and file cache from memory.
 *
 * @param {string} url The blob URL.
 */
export function revokeBlobURL( url ) {
	if ( cache[ url ] ) {
		revokeObjectURL( url );
	}

	delete cache[ url ];
}
