/**
 * WordPress dependencies
 */
import { button as icon } from '@wordpress/icons';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import edit from './edit';
import save from './save';
import { getCategoryWithFallbacks } from '../../../block-helpers';

const name = 'premium-content/login-button';
const category = getCategoryWithFallbacks( 'design', 'common' );

/**
 * @typedef {object} Attributes
 * @property { string } text
 * @property { number } borderRadius
 * @property { string } backgroundColor
 * @property { string } textColor
 * @property { string } gradient
 * @property { object } style
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
		lightBlockWrapper: true,
	},
	styles: [
		{ name: 'fill', label: __( 'Fill', 'full-site-editing' ), isDefault: true },
		{ name: 'outline', label: __( 'Outline', 'full-site-editing' ) },
	],
	edit,
	save,
};

export { name, category, settings };
