/* eslint-disable import/no-extraneous-dependencies */
/**
 * Internal dependencies
 */
import { registerBlockType } from '@wordpress/blocks';
/* eslint-enable import/no-extraneous-dependencies */

/**
 * NHA dependencies
 */
import { settings } from './newspack-homepage-articles/blocks/homepage-articles/index';

registerBlockType( 'a8c/homepage-posts', {
	...settings,
	category: 'layout',
} );
