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
	attributes: {
		'premium-content/container/selectedPlanId': {
			type: 'number',
			default: 0,
		},
	},

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
	save,
	context: [ 'premium-content/container/selectedPlanId' ],
};

export { name, category, settings };
