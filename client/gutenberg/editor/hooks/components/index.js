/** @format */
/**
 * WordPress dependencies
 */
import { addFilter } from '@wordpress/hooks';

/**
 * Internal dependencies
 */
import MediaUpload from './media-upload';

const replaceMediaUpload = () => MediaUpload;

addFilter(
	'editor.MediaUpload',
	'calypso/gutenberg/editor/components/media-upload/replace-media-upload',
	replaceMediaUpload
);
