/** @format */
/* eslint-disable wpcalypso/import-docblock */
/**
 * WordPress dependencies
 */
import { addFilter } from '@wordpress/hooks';

const replaceMediaUpload = () => null; // GUTENLYPSO

addFilter(
	'editor.MediaUpload',
	'core/edit-post/components/media-upload/replace-media-upload',
	replaceMediaUpload
);
