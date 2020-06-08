/**
 * Internal dependencies
 */
import edit from './edit';
import save from './save';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';


const name = 'premium-content/logged-out-view';
const category = 'common';
/**
 * @typedef {object} Attributes
 * @property {string} subscribeButtonText
 * @property {string} loginButtonText
 * @property {string} buttonClasses
 * @property {string} backgroundButtonColor
 * @property {string} textButtonColor
 * @property {string} customBackgroundButtonColor
 * @property {string} customTextButtonColor
 *
 * @typedef {import('@wordpress/blocks').BlockConfiguration<Attributes>} BlockConfiguration
 * @type {BlockConfiguration}
 */
const settings = {
	name,
	category,
	attributes: {
		subscribeButtonText: {
			type: 'string',
			default: 'Subscribe',
		},
		loginButtonText: {
			type: 'string',
			default: 'Log In',
		},
		buttonClasses: {
			type: 'string',
			default: '',
		},
		backgroundButtonColor: {
			type: 'string',
			default: '',
		},
		textButtonColor: {
			type: 'string',
			default: '',
		},
		customBackgroundButtonColor: {
			type: 'string',
			default: '',
		},
		customTextButtonColor: {
			type: 'string',
			default: '',
		},
	},

	/* translators: block name */
	title: __( 'Logged Out View', 'full-site-editing' ),
	/* translators: block description */
	description: __( 'Logged Out View.', 'full-site-editing' ),
	parent: [ 'premium-content/container' ],
	supports: {
		// Hide this block from the inserter.
		inserter: false,
		html: false,
	},
	withoutInteractiveFormatting: true,
	edit,
	save,
};

export { name, category, settings };
