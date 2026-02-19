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

// Initialize Image Studio integration
if ( document.readyState === 'loading' ) {
	document.addEventListener( 'DOMContentLoaded', initImageStudioIntegration );
} else {
	initImageStudioIntegration();
}

// Register block editor filters for image toolbar and media sources
registerBlockEditorFilters();
