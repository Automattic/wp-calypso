import { addFilter } from '@wordpress/hooks';
import { withImageStudioToolbarButton } from './image-toolbar-extension';
import { addImageStudioMediaSource } from './external-media-source-extension';
import { withImageStudioGenerateButton } from './generate-button-extension';

export function registerBlockEditorFilters() {
	addFilter( 'editor.BlockEdit', 'automattic/image-studio', withImageStudioToolbarButton );

	addFilter(
		'jetpack.externalMedia.extraMediaSources',
		'automattic/image-studio',
		addImageStudioMediaSource
	);

	addFilter(
		'editor.MediaUpload',
		'automattic/image-studio-generate',
		withImageStudioGenerateButton
	);
}
