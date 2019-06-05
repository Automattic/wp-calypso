/**
 * WordPress dependencies
 */
import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import { ServerSideRender } from '@wordpress/components';

/**
 * Internal dependencies
 */
import './style.scss';

registerBlockType( 'a8c/navigation-placeholder', {
	title: __( 'Navigation Placeholder' ),
	description: __( 'Placeholder for site-wide navigation and menus.' ),
	icon: 'layout',
	category: 'layout',
	supports: {
		align: [ 'wide', 'full' ],
		anchor: true,
		html: false,
		multiple: false,
		reusable: false,
	},
	edit: function() {
		return <ServerSideRender block="a8c/navigation-placeholder" />;
	},
	save: () => null,
} );
