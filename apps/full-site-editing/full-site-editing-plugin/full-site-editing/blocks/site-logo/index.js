/**
 * WordPress dependencies
 */
import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import './style.scss';
import './edit.scss';
import edit from './edit';

registerBlockType( 'a8c/site-logo', {
	title: __( 'Site Logo' ),
	description: __( 'Site Logo' ),
	icon: 'format-image',
	category: 'layout',
	keywords: [ __( 'logo' ), __( 'icon' ), __( 'site' ) ],
	edit,
	save: () => null,
} );
