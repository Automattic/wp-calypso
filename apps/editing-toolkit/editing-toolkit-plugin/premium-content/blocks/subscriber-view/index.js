/**
 * Internal dependencies
 */
import edit from './edit';
import save from './save';
import deprecated from './deprecated/v1';
import { getCategoryWithFallbacks } from '../../../block-helpers';
import icon from '../icon.js';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

const name = 'premium-content/subscriber-view';
const category = getCategoryWithFallbacks( 'design', 'common' );
const settings = {
	name,
	category,
	attributes: {},

	/* translators: block name */
	title: __( 'Subscriber View', 'full-site-editing' ),
	/* translators: block description */
	description: __( 'Subscriber View.', 'full-site-editing' ),
	parent: [ 'premium-content/container' ],
	supports: {
		// Hide this block from the inserter.
		inserter: false,
		html: false,
	},
	edit,
	icon,
	save,
	deprecated,
};

export { name, category, settings };
