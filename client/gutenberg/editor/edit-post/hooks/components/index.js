/**
 * External dependencies
 */
import { addFilter } from '@wordpress/hooks';

const replaceMediaUpload = () => null;

addFilter(
	'editor.MediaUpload',
	'core/edit-post/components/media-upload/replace-media-upload',
	replaceMediaUpload
);
