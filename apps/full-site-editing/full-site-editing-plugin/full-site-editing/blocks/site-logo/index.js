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
import './edit.scss';

registerBlockType( 'a8c/site-logo', {
	title: __( 'Site Logo' ),
	description: __( 'Site Logo' ),
	icon: 'format-image',
	category: 'layout',
	keywords: [ __( 'logo' ), __( 'icon' ), __( 'site' ) ],
	edit: () => {
		return <ServerSideRender block="a8c/site-logo" attributes={ { addSiteLink: false } } />;
	},
	save: () => null,
} );
