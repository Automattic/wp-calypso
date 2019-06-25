/**
 * External dependencies
 */
import { createRegistrySelector } from '@wordpress/data';
import { get } from 'lodash';

export const isFullSitePage = createRegistrySelector( select => () => {
	const { getBlocks, getCurrentPostType, getEditedPostAttribute } = select( 'core/editor' );

	const postType = getCurrentPostType();
	const templateId = get( getEditedPostAttribute( 'meta' ), '_wp_template_id' );
	const blocks = getBlocks();

	const isPage = postType === 'page';
	const hasTemplate = !! templateId;
	const hasPostContentBlock = !! blocks.find( block => block.name === 'a8c/post-content' );

	return isPage && hasTemplate && hasPostContentBlock;
} );
