/**
 * Stub for `@wordpress/vips/worker`, aliased in for the reader chat build only.
 *
 * Keeping it avoids re-inlining libvips as ~15MB of base64 WASM, which the frontend
 * bundle would otherwise pull in via `@wordpress/upload-media` and never execute.
 *
 * Processing helpers reject so a real caller fails loudly rather than silently
 * mishandling an upload. Cancel/terminate are no-ops: `@wordpress/upload-media` only
 * calls them once the real module has loaded.
 */

function unavailable() {
	return Promise.reject(
		new Error( 'vips image processing is not bundled in the reader chat build.' )
	);
}

export const vipsCompressImage = unavailable;
export const vipsConvertImageFormat = unavailable;
export const vipsHasTransparency = unavailable;
export const vipsResizeImage = unavailable;
export const vipsRotateImage = unavailable;

export function vipsCancelOperations() {
	return Promise.resolve( false );
}

export function terminateVipsWorker() {}
