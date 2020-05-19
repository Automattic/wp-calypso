/**
 * Internal dependencies
 */
import edit from './edit';
import save from './save';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

const name = 'premium-content/subscriber-view';
const category = 'common';
const settings = {
	name,
	category,
	attributes: {},

	/* translators: block name */
	title: __( 'Subscriber View', 'premium-content' ),
	/* translators: block description */
	description: __( 'Subscriber View.', 'premium-content' ),
	parent: [ 'premium-content/container' ],
	supports: {
		// Hide this block from the inserter.
		inserter: false,
	},
	edit,
	save,
};

export { name, category, settings };
