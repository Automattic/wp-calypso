/**
 * Internal dependencies
 */
import edit from './edit';
import save from './save';
import deprecated from './deprecated';
import { getCategoryWithFallbacks } from '../../../block-helpers';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';


const name = 'premium-content/logged-out-view';
const category = getCategoryWithFallbacks( 'design', 'common' );
/**
 * @typedef {object} Attributes
 * @typedef {import('@wordpress/blocks').BlockConfiguration<Attributes>} BlockConfiguration
 * @type {BlockConfiguration}
 * @property
 */
const settings = {
	name,
	category,
	attributes: {},
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
	deprecated,
};

export { name, category, settings };
