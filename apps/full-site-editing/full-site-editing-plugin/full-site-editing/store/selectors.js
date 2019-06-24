/**
 * External dependencies
 */
import { createRegistrySelector } from '@wordpress/data';
import { get } from 'lodash';

export const hasPostContentBlock = createRegistrySelector( select => () => {
	const blocks = select( 'core/editor' ).getBlocks();
	return !! blocks.find( block => block.name === 'a8c/post-content' );
} );

export const getTemplateId = createRegistrySelector( select => () => {
	return get( select( 'core/editor' ).getEditedPostAttribute( 'meta' ), '_wp_template_id' );
} );

export const isFullPage = createRegistrySelector( select => () => {
	const postType = select( 'core/editor' ).getEditedPostAttribute( 'type' );
	return postType === 'page' && getTemplateId() && hasPostContentBlock();
} );
