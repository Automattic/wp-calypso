/**
 * Stub for `@wordpress/vips/worker` in the reader-chat bundle.
 *
 * `@wordpress/block-editor` depends on `@wordpress/upload-media`, which lazy-imports
 * `@wordpress/vips/worker` to do client-side image processing. That worker ships
 * libvips as base64-inlined WASM (`vips.wasm` + `vips-heif.wasm`), so webpack emits
 * it as a ~15MB chunk.
 *
 * Reader chat never reaches that code: it has no block editor canvas, and its own
 * image uploads go through `@wordpress/media-utils` (a plain REST upload), not
 * `@wordpress/upload-media`. Only the frontend bundle disables dependency
 * externalization, so it is also the only entry point that would inline the chunk.
 *
 * The processing helpers reject rather than silently return, so a future code path
 * that does depend on them fails loudly instead of corrupting an upload. The
 * cancel/terminate helpers are no-ops — upload-media guards both behind an
 * already-loaded module, so they are unreachable here, but a no-op keeps any
 * future cleanup path from throwing.
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
