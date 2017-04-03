/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { index, blocks, contentPreview } from './controller';

export default function() {
	page( '/pandance', index );
	page( '/pandance/blocks', blocks );
	page( '/pandance/content-preview', contentPreview );
}
