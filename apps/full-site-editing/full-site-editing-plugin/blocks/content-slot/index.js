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
		registerBlockType( 'a8c/content-slot', {
			title: __( 'Content Slot' ),
			description: __( 'Placeholder for a post or a page.' ),
			icon: 'layout',
			category: 'layout',
			supports: {
				align: [ 'wide', 'full' ],
				anchor: true,
				html: false,
				multiple: false,
				reusable: false,
			},
			edit,
			save: () => null,
		} );
	}
} );
