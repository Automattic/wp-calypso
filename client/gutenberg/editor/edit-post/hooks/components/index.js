/** @format */
/* eslint-disable wpcalypso/import-docblock */
/**
 * WordPress dependencies
 */
import { removeFilter } from '@wordpress/hooks';

// GUTENLYPSO START
removeFilter( 'editor.MediaUpload', 'core/edit-post/components/media-upload/replace-media-upload' );
// GUTENLYPSO END
