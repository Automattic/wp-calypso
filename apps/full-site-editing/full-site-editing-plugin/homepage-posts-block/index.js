/* eslint-disable import/no-extraneous-dependencies */
/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { registerBlockType } from '@wordpress/blocks';

/**
 * Newspack dependencies
 */
import { settings } from './newspack-blocks/src/blocks/homepage-articles/index';

registerBlockType( 'a8c/homepage-posts', {
	...settings,
	title: __( 'Homepage Posts' ),
	category: 'layout',
} );
