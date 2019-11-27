/**
 * Internal dependencies
 */
import { registerBlockType } from '@wordpress/blocks';

/**
 * NHA dependencies
 */
import { settings } from './newspack-homepage-articles/blocks/homepage-articles/index';

registerBlockType( 'a8c/homepage-posts', {
    ...settings,
    title: __( 'Homepage Posts' ),
    category: 'layout',
} );
