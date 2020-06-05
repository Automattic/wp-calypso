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
 * @property { string } backgroundColor
 * @property { string } textColor
 * @property { string } backgroundButtonColor
 * @property { string } gradient
 *
 * @typedef {import('@wordpress/blocks').BlockConfiguration<Attributes>} BlockConfiguration
 * @type {BlockConfiguration}
 */
const settings = {
	name,
	attributes: {
		text: {
			type: 'string',
			source: 'html',
			selector: 'a',
			default: __( 'Subscribe', 'premium-content' ),
		},
		type: {
			type: 'string',
			default: 'subscribe',
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
			type: 'string',
		},
	},
	icon,
	/* translators: block name */
	title: __( 'Premium Content Button', 'premium-content' ),
	/* translators: block description */
	description: __( 'Premium Content Button.', 'premium-content' ),
	parent: [ 'premium-content/logged-out-view', 'core/buttons' ],
	supports: {
		align: true,
		alignWide: false,
		html: false,
		reusable: false,
		lightBlockWrapper: true,
	},
	styles: [
		{ name: 'fill', label: __( 'Fill', 'premium-content' ), isDefault: true },
		{ name: 'outline', label: __( 'Outline', 'premium-content' ) },
	],
	edit,
	save,
};

export { name, category, settings };
