/**
 * Image Studio Entry Point
 *
 * Entry point for the standalone Image Studio bundle.
 * This is loaded on pages where Image Studio should be available
 * (Media Library, Block Editor, etc.)
 */

/**
 * External dependencies
 */
import { initImageStudioIntegration, registerBlockEditorFilters } from '@automattic/image-studio';
/**
 * Internal dependencies
 */
import setLocale from './set-locale';

async function init() {
	// Load translations before first render — __() won't trigger re-renders.
	const localeSlug = document.documentElement.lang?.toLowerCase();
	await setLocale( localeSlug );

	initImageStudioIntegration();
	registerBlockEditorFilters();
}

if ( document.readyState === 'loading' ) {
	document.addEventListener( 'DOMContentLoaded', () => init() );
} else {
	init();
}
