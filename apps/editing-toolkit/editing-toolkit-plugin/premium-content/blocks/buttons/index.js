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
import { getCategoryWithFallbacks } from '../../../block-helpers';

const name = 'premium-content/buttons';
const category = getCategoryWithFallbacks( 'design', 'common' );

const settings = {
	name,
	category,
	title: __( 'Premium Content buttons', 'full-site-editing' ),
	description: __(
		'Prompt Premium Content visitors to take action with a group of button-style links.',
		'full-site-editing'
	),
	icon,
	supports: {
		align: true,
		alignWide: false,
		lightBlockWrapper: true,
	},
	attributes: {
		isPremiumContentChild: {
			type: 'bool',
			default: true,
		},
	},
	providesContext: {
		isPremiumContentChild: 'isPremiumContentChild',
	},
	keywords: [ __( 'link', 'full-site-editing' ) ],
	edit,
	save,
	usesContext: [ 'premium-content/planId', 'premium-content/isPreview' ],
};

export { name, category, settings };
