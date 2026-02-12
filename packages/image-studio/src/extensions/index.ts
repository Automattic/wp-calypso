import { addFilter } from '@wordpress/hooks';
import { addImageStudioMediaSource } from './external-media-source-extension';
import { withImageStudioGenerateButton } from './generate-button-extension';
import { withImageStudioToolbarButton } from './image-toolbar-extension';

let filtersRegistered = false;

export function registerBlockEditorFilters() {
	if ( filtersRegistered ) {
		return;
	}
	filtersRegistered = true;

	addFilter( 'editor.BlockEdit', 'big-sky/image-studio', withImageStudioToolbarButton );

	addFilter(
		'jetpack.externalMedia.extraMediaSources',
		'big-sky/image-studio',
		addImageStudioMediaSource
	);

	addFilter( 'editor.MediaUpload', 'big-sky/generate-button', withImageStudioGenerateButton );
}
