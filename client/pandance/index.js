/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { removeSidebar, index, blocks, contentPreview, customize, customizeBlock } from './controller';

export default function() {
	page( '/pandance', removeSidebar, index );
	page( '/pandance/blocks', removeSidebar, blocks );
	page( '/pandance/content-preview', removeSidebar, contentPreview );
	page( '/pandance/customize', removeSidebar, customize );
	page( '/pandance/customize/:blockId', removeSidebar, customizeBlock );
}
