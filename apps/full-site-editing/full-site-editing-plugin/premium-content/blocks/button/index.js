/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { button as icon } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import edit from './edit';
import save from './save';

const name = 'premium-content/button';
const category = 'common';

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
	title: __( 'Premium Content button', 'full-site-editing' ),
	description: __(
		'Prompt non-subscriber visitors to take action with a button-style link.',
		'full-site-editing'
	),
	attributes: {
		text: {
			type: 'string',
			source: 'html',
			selector: 'a',
			default: __( 'Subscribe', 'full-site-editing' ),
		},
		type: {
			type: 'string',
			default: 'subscribe',
		},
		borderRadius: {
			type: 'number',
		},
	},
	icon,
	keywords: [ __( 'link', 'full-site-editing' ) ],
	parent: [ 'premium-content/buttons' ],
	supports: {
		align: true,
		alignWide: false,
		html: false,
		reusable: false,
		lightBlockWrapper: true,
		__experimentalColor: { gradients: true },
	},
	styles: [
		{ name: 'fill', label: __( 'Fill', 'full-site-editing' ), isDefault: true },
		{ name: 'outline', label: __( 'Outline', 'full-site-editing' ) },
	],
	edit,
	save,
};

export { name, category, settings };
