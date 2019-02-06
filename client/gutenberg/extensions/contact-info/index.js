/** @format */
/**
 * External dependencies
 */
import { InnerBlocks } from '@wordpress/editor';
import { Path } from '@wordpress/components';

/**
 * Internal dependencies
 */
import edit from './edit';
import renderMaterialIcon from 'gutenberg/extensions/presets/jetpack/utils/render-material-icon';
import { __, _x } from 'gutenberg/extensions/presets/jetpack/utils/i18n';
import './editor.scss';
import './style.scss';
import { name as addressName, settings as addressSettings } from './address/';
import { name as emailName, settings as emailSettings } from './email/';
import { name as phoneName, settings as phoneSettings } from './phone/';

const attributes = {};

const save = ( { className } ) => (
	<div className={ className } itemprop="location" itemscope itemtype="http://schema.org/Place">
		<InnerBlocks.Content />
	</div>
);

export const name = 'contact-info';

export const settings = {
	title: __( 'Contact Info' ),
	description: __(
		'Lets you add an email address, phone number, and physical address with improved markup for better SEO results.'
	),
	keywords: [
		_x( 'email', 'block search term' ),
		_x( 'phone', 'block search term' ),
		_x( 'address', 'block search term' ),
	],
	icon: renderMaterialIcon(
		<Path d="M22 3H2C.9 3 0 3.9 0 5v14c0 1.1.9 2 2 2h20c1.1 0 1.99-.9 1.99-2L24 5c0-1.1-.9-2-2-2zm0 16H2V5h20v14zm-2.99-1.01L21 16l-1.51-2h-1.64c-.22-.63-.35-1.3-.35-2s.13-1.37.35-2h1.64L21 8l-1.99-1.99c-1.31.98-2.28 2.37-2.73 3.99-.18.64-.28 1.31-.28 2s.1 1.36.28 2c.45 1.61 1.42 3.01 2.73 3.99zM9 12c1.65 0 3-1.35 3-3s-1.35-3-3-3-3 1.35-3 3 1.35 3 3 3zm0-4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm6 8.59c0-2.5-3.97-3.58-6-3.58s-6 1.08-6 3.58V18h12v-1.41zM5.48 16c.74-.5 2.22-1 3.52-1s2.77.49 3.52 1H5.48z" />
	),
	category: 'jetpack',
	supports: {
		align: [ 'wide', 'full' ],
		html: false,
	},
	attributes,
	edit,
	save,
};

export const childBlocks = [
	{ name: addressName, settings: addressSettings },
	{ name: emailName, settings: emailSettings },
	{ name: phoneName, settings: phoneSettings },
];
