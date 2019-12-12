/**
 * External dependencies
 */

/* eslint-disable import/no-extraneous-dependencies */
/**
 * WordPress dependencies
 */
import { createBlock } from '@wordpress/blocks';
/* eslint-enable import/no-extraneous-dependencies */

const CORE_NAVIGATION_BLOCK_TYPE = 'core/navigation';
const CORE_NAVIGATION_ITEM_BLOCK_TYPE = 'core/navigation-link';
export const isValidCoreNavigationBlockType = type => CORE_NAVIGATION_BLOCK_TYPE === type;

export default {
	to: [
		{
			type: 'block',
			blocks: [ CORE_NAVIGATION_BLOCK_TYPE ],
			__experimentalConvert( { attributes, clientId } ) {
				let menuItems;
				let navItems;

				const menuItemScriptTag = document.querySelector( `#block-${ clientId } script` );

				if ( menuItemScriptTag ) {
					// Existing Menu items are stored as JSON alongside the ServerSideRendered
					// block HTML markup.
					menuItems = JSON.parse( menuItemScriptTag.innerHTML );
				}

				if ( menuItems ) {
					// Each Menu Items should become a Nav Link Block
					navItems = menuItems.map( item => {
						return createBlock( CORE_NAVIGATION_ITEM_BLOCK_TYPE, {
							label: item.post_title || item.title,
							title: item.post_title || item.title,
							url: item.url,
						} );
					} );
				}

				// Create Nav Block mapping attrs and Nav Items
				return createBlock(
					CORE_NAVIGATION_BLOCK_TYPE,
					{
						align: attributes.align,
						itemsJustification: attributes.textAlign,
					},
					navItems
				);
			},
		},
	],
};
