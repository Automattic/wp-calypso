/**
 * WordPress dependencies
 */
import { registerBlockType } from '@wordpress/blocks';
import { select } from '@wordpress/data';
import domReady from '@wordpress/dom-ready';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import edit from './edit';
import './style.scss';

domReady( () => {
	if ( 'wp_template' === select( 'core/editor' ).getCurrentPostType() ) {
		registerBlockType( 'a8c/template-part', {
			title: __( 'Template Part' ),
			description: __( 'Display a template part.' ),
			icon: 'layout',
			category: 'layout',
			attributes: {
				selectedPostId: { type: 'number' },
				selectedPostType: { type: 'string' },
			},
			supports: {
				align: [ 'wide', 'full' ],
				anchor: true,
				html: false,
				reusable: false,
			},
			edit,
			save: () => null,
		} );
	}
} );
