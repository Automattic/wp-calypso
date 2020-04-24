/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import edit from './edit';
import save from './save';

const name = 'premium-content/container';
const category = 'common';

/**
 * @typedef { Object } Attributes
 * @property { string } newPlanName
 * @property { string } newPlanCurrency
 * @property { number } newPlanPrice
 * @property { string } newPlanInterval
 * @property { number } selectedPlanId
 *
 * @typedef {import('@wordpress/blocks').BlockConfiguration<Attributes>} BlockConfiguration
 * @type {BlockConfiguration}
 */
const settings = {
	name,
	attributes: {
		newPlanName: {
			type: 'string',
			default: 'Monthly Subscription',
		},
		newPlanCurrency: {
			type: 'string',
			default: 'USD',
		},
		newPlanPrice: {
			type: 'number',
			default: 5,
		},
		newPlanInterval: {
			type: 'string',
			default: '1 month',
		},
		selectedPlanId: {
			type: 'number',
			default: 0,
		},
	},
	/**
	 * This is the display title for your block, which can be translated with `i18n` functions.
	 * The block inserter will show this name.
	 */
	title: __( 'Premium Content', 'premium-content' ),

	/**
	 * This is a short description for your block, can be translated with `i18n` functions.
	 * It will be shown in the Block Tab in the Settings Sidebar.
	 */
	description: __( 'Restrict access to your content for paying subscribers.', 'premium-content' ),

	/**
	 * Blocks are grouped into categories to help users browse and discover them.
	 * The categories provided by core are `common`, `embed`, `formatting`, `layout` and `widgets`.
	 */
	category,

	/**
	 * An icon property should be specified to make it easier to identify a block.
	 * These can be any of WordPress’ Dashicons, or a custom svg element.
	 */
	icon: 'lock',

	/**
	 * Optional block extended support features.
	 */
	supports: {
		// Removes support for an HTML mode.
		html: false,
	},
	keywords: [
		'premium-content',
		/* translators: block keyword */
		__( 'premium', 'premium-content' ),
		/* translators: block keyword */
		__( 'paywall', 'premium-content' ),
	],
	edit,
	save,
};

export { name, category, settings };
