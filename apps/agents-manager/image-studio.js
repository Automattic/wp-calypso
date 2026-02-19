/**
 * Image Studio Entry Point
 *
 * Entry point for the standalone Image Studio bundle.
 * This is loaded on pages where Image Studio should be available
 * (Media Library, Block Editor, etc.)
 */

/**
 * Internal dependencies
 */
import setLocale from './set-locale';

async function init() {
	// Load translations before importing image-studio. Using dynamic import()
	// so that module-level __() calls in image-studio evaluate after
	// translations are loaded.
	const localeSlug = document.documentElement.lang?.toLowerCase();
	await setLocale( localeSlug );

	const { initImageStudioIntegration, registerBlockEditorFilters } = await import(
		'@automattic/image-studio'
	);
	initImageStudioIntegration();
	registerBlockEditorFilters();
}

if ( document.readyState === 'loading' ) {
	document.addEventListener( 'DOMContentLoaded', () => init() );
} else {
	init();
}
