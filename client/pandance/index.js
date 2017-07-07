/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { removeSidebar, index, businessInfo, contentPreview, customizeBlock, createAccount } from './controller';

export default function() {
	page( '/pandance', removeSidebar, index );
	page( '/pandance/info', removeSidebar, businessInfo );
	page( '/pandance/content-preview', removeSidebar, contentPreview );
	page( '/pandance/create-account', removeSidebar, createAccount );
	page( '/pandance/customize', removeSidebar, customizeBlock );
	page( '/pandance/customize/:blockId', removeSidebar, customizeBlock );
}
