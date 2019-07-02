/* global fullSiteEditing */

/**
 * External dependencies
 */
import { InnerBlocks } from '@wordpress/editor';

const isTemplatePostType = 'wp_template' === fullSiteEditing.editorPostType;
export default ( isTemplatePostType ? () => null : () => <InnerBlocks.Content /> );
