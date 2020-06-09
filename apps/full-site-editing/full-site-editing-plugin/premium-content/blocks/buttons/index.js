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

const name = 'premium-content/buttons';
const category = 'common';

const settings = {
	name,
	title: __( 'Premium Content buttons', 'full-site-editing' ),
	description: __(
		'Prompt non-subscriber visitors to take action with a group of button-style links.',
		'full-site-editing'
	),
	category,
	supports: {
		align: true,
		alignWide: false,
		lightBlockWrapper: true,
	},
	icon,
	keywords: [ __( 'link', 'full-site-editing' ) ],
	parent: [ 'premium-content/logged-out-view' ],
	edit,
	save,
};

export { name, category, settings };
