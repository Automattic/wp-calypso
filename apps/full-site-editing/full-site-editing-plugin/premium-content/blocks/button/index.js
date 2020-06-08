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
	/* translators: block name */
	title: __( 'Premium Content Button', 'full-site-editing' ),
	/* translators: block description */
	description: __( 'Premium Content Button.', 'full-site-editing' ),
	parent: [ 'premium-content/logged-out-view', 'core/buttons' ],
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
