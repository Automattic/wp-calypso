/**
 * WordPress dependencies
 */
import { createBlock } from '@wordpress/blocks';
import { button as icon } from '@wordpress/icons';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import edit from './edit';
import save from './save';

const name = 'premium-content/login-button';
const category = 'design';

/**
 * @typedef {object} Attributes
 * @property { string } text
 * @property { string } type
 * @property { number } borderRadius
 *
 * @typedef {import('@wordpress/blocks').BlockConfiguration<Attributes>} BlockConfiguration
 * @type {BlockConfiguration}
 */
const settings = {
	name,
	title: __( 'Premium Content login button', 'full-site-editing' ),
	description: __(
		'Prompt subscriber visitors to log in with a button-style link (only visible for logged out users).',
		'full-site-editing'
	),
	attributes: {
		text: {
			type: 'string',
			source: 'html',
			selector: 'a',
			default: __( 'Log in', 'full-site-editing' ),
		},
		borderRadius: {
			type: 'number',
		},
		backgroundColor: {
			type: 'string',
		},
		textColor: {
			type: 'string',
		},
		gradient: {
			type: 'string',
		},
		style: {
			type: 'object',
		},
	},
	icon,
	keywords: [ __( 'link', 'full-site-editing' ) ],
	supports: {
		align: true,
		alignWide: false,
		html: false,
		reusable: false,
		lightBlockWrapper: true,
	},
	styles: [
		{ name: 'fill', label: __( 'Fill', 'full-site-editing' ), isDefault: true },
		{ name: 'outline', label: __( 'Outline', 'full-site-editing' ) },
	],
	parent: [ 'core/buttons' ],
	edit,
	save,
	transforms: {
		from: [
			{
				type: 'block',
				blocks: [ 'core/button' ],
				__experimentalConvert: ( block ) =>
					createBlock( 'premium-content/login-button', block.attributes ),
			},
		],
		to: [
			{
				type: 'block',
				blocks: [ 'core/button' ],
				__experimentalConvert: ( block ) => createBlock( 'core/button', block.attributes ),
			},
		],
	},
};

export { name, category, settings };
