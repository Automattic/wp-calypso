/* eslint-disable import/no-extraneous-dependencies */
/**
 * Internal dependencies
 */
import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
/* eslint-enable import/no-extraneous-dependencies */

/**
 * NHA dependencies
 */
import { settings } from './newspack-homepage-articles/blocks/homepage-articles/index';

registerBlockType( 'a8c/blog-posts', {
	...settings,
	title: __( 'Blog Posts', 'full-site-editing' ),
	category: 'layout',
} );
