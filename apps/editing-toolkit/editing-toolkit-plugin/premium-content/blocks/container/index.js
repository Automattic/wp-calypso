/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { getCurrencyDefaults } from '@automattic/format-currency';
import { trimEnd } from 'lodash';
import { createBlock } from '@wordpress/blocks';
import { select } from '@wordpress/data';

/**
 * Internal dependencies
 */
import edit from './edit';
import save from './save';
import { getCategoryWithFallbacks } from '../../../block-helpers';
import icon from '../icon.js';

const name = 'premium-content/container';
const category = getCategoryWithFallbacks( 'earn', 'common' );

const blockContainsPremiumBlock = ( block ) => {
	if ( block.name.indexOf( 'premium-content/' ) === 0 ) {
		return true;
	}

	return block.innerBlocks.some( blockContainsPremiumBlock );
};

const blockHasParentPremiumBlock = ( block ) => {
	const { getBlocksByClientId, getBlockParents } = select( 'core/block-editor' );
	const parents = getBlocksByClientId( getBlockParents( block.clientId ) );
	return !! parents.find( ( parent ) => parent.name.indexOf( 'premium-content/' ) === 0 );
};

/**
 * @typedef {object} Attributes
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
		isPreview: {
			type: 'boolean',
			default: false,
		},
	},
	/**
	 * This is the display title for your block, which can be translated with `i18n` functions.
	 * The block inserter will show this name.
	 */
	title: __( 'Premium Content', 'full-site-editing' ),

	/**
	 * This is a short description for your block, can be translated with `i18n` functions.
	 * It will be shown in the Block Tab in the Settings Sidebar.
	 */
	description: __( 'Restrict access to your content for paying subscribers.', 'full-site-editing' ),

	/**
	 * Blocks are grouped into categories to help users browse and discover them.
	 * The categories provided by core are `common`, `embed`, `formatting`, `layout` and `widgets`.
	 */
	category,

	/**
	 * An icon property should be specified to make it easier to identify a block.
	 * These can be any of WordPress’ Dashicons, or a custom svg element.
	 */
	icon,

	example: {
		attributes: {
			isPreview: true,
		},
	},

	/**
	 * Optional block extended support features.
	 */
	supports: {
		// Removes support for an HTML mode.
		html: false,
	},
	transforms: {
		from: [
			{
				type: 'block',
				isMultiBlock: true,
				blocks: [ '*' ],
				__experimentalConvert( blocks ) {
					// Avoid transforming any premium-content block.
					if ( blocks.some( blockContainsPremiumBlock ) ) {
						return;
					}

					// Avoid transforming if any parent is a premium-content block. Blocks share same parents since they
					// are siblings, so checking the first one is enough.
					if ( blockHasParentPremiumBlock( blocks[ 0 ] ) ) {
						return;
					}

					// Clone the Blocks
					// Failing to create new block references causes the original blocks
					// to be replaced in the switchToBlockType call thereby meaning they
					// are removed both from their original location and within the
					// new premium content block.
					const innerBlocksSubscribe = blocks.map( ( block ) => {
						return createBlock( block.name, block.attributes, block.innerBlocks );
					} );

					return createBlock( 'premium-content/container', {}, [
						createBlock( 'premium-content/subscriber-view', {}, innerBlocksSubscribe ),
						createBlock( 'premium-content/logged-out-view' ),
					] );
				},
			},
		],
	},
	keywords: [
		'premium-content',
		/* translators: block keyword */
		__( 'premium', 'full-site-editing' ),
		/* translators: block keyword */
		__( 'paywall', 'full-site-editing' ),
	],
	edit,
	save,
	providesContext: {
		'premium-content/planId': 'selectedPlanId',
		'premium-content/isPreview': 'isPreview',
	},
};

export { name, category, settings };

/**
 * Currencies we support and Stripe's minimum amount for a transaction in that currency.
 *
 * https://stripe.com/docs/currencies#minimum-and-maximum-charge-amounts
 *
 * @type { [currency: string]: number }
 */
export const SUPPORTED_CURRENCIES = {
	USD: 0.5,
	AUD: 0.5,
	BRL: 0.5,
	CAD: 0.5,
	CHF: 0.5,
	DKK: 2.5,
	EUR: 0.5,
	GBP: 0.3,
	HKD: 4.0,
	INR: 0.5,
	JPY: 50,
	MXN: 10,
	NOK: 3.0,
	NZD: 0.5,
	PLN: 2.0,
	SEK: 3.0,
	SGD: 0.5,
};

/**
 * Compute a list of currency value and display labels.
 *
 * - `value` is the currency's three character code
 * - `label` is the user facing representation.
 *
 * @typedef {{value: string, label: string}} CurrencyDetails
 *
 * @type Array<CurrencyDetails>
 */
export const CURRENCY_OPTIONS = Object.keys( SUPPORTED_CURRENCIES ).map( ( value ) => {
	const { symbol } = getCurrencyDefaults( value );
	const label = symbol === value ? value : `${ value } ${ trimEnd( symbol, '.' ) }`;
	return { value, label };
} );

/**
 * Returns the minimum transaction amount for the given currency. If currency is not one of the
 * known types it returns ...
 *
 * @param {string} currency_code three character currency code to get minimum charge for
 * @returns {number} Minimum charge amount for the given currency_code
 */
export function minimumTransactionAmountForCurrency( currency_code ) {
	const minimum = SUPPORTED_CURRENCIES[ currency_code ];
	return minimum;
}

/**
 * True if the price is a number and at least the minimum allowed amount.
 *
 * @param {string} currency Currency for the given price.
 * @param {number} price Price to check.
 * @returns {boolean} true if valid price
 */
export function isPriceValid( currency, price ) {
	return ! isNaN( price ) && price >= minimumTransactionAmountForCurrency( currency );
}
