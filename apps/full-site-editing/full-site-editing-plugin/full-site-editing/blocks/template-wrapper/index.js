/**
 * WordPress dependencies
 */
import { InnerBlocks } from '@wordpress/block-editor';
import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import './style.scss';

registerBlockType( 'a8c/template-wrapper', {
	title: __( 'Template Wrapper' ),
	description: __( 'Display a template part.' ),
	icon: 'layout',
	category: 'layout',
	attributes: { position: { type: 'string' } },
	supports: {
		align: [ 'full' ],
		html: false,
		inserter: false,
		reusable: false,
	},
	edit: () => <InnerBlocks />,
	save: () => <InnerBlocks.Content />,
} );
