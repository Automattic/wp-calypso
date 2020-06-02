/**
 * BLOCK: Button Block
 *
 * Registering a basic block with Gutenberg.
 * Simple block, renders and saves the same content without any interactivity.
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
 * @property { string } blockID
 * @property { string } buttonText
 * @property { string } align
 * @property { string } buttonType
 * @property { string } buttonClasses
 * @property { string } backgroundButtonColor
 * @property { string } textButtonColor
 * @property { string } customBackgroundButtonColor
 * @property { string } customTextButtonColor
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
		},
		type: {
			type: 'string',
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
	},
	icon,
	/* translators: block name */
	title: __( 'Premium Content Button', 'premium-content' ),
	/* translators: block description */
	description: __( 'Premium Content Button.', 'premium-content' ),
	parent: [ 'premium-content/logged-out-view' ],
	supports: {
		align: true,
		alignWide: false,
		html: false,
		reusable: false,
		lightBlockWrapper: true,
	},
	edit,
	save,
	context: [ 'premium-content/planId' ],
};

export { name, category, settings };
