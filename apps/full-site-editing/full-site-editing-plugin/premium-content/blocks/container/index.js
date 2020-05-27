/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { getCurrencyDefaults } from '@automattic/format-currency';
import { trimEnd } from 'lodash';

/**
 * Internal dependencies
 */
import edit from './edit';
import save from './save';

const name = 'premium-content/container';
const category = 'common';

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
	icon: (
		<svg width="25" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path
				d="M12.7439 14.4271L8.64053 13.165L8.51431 13.8718L8.09208 20.7415C8.06165 21.2365 8.61087 21.5526 9.02363 21.2776L12.7439 18.799L16.7475 21.304C17.1687 21.5676 17.7094 21.2343 17.6631 20.7396L17.0212 13.8718L17.0212 13.165L12.7439 14.4271Z"
				fill="black"
			/>
			<circle cx="12.7439" cy="8.69796" r="5.94466" stroke="black" strokeWidth="1.5" fill="none" />
			<path
				d="M9.71023 8.12461L11.9543 10.3687L15.7776 6.54533"
				stroke="black"
				strokeWidth="1.5"
				fill="none"
			/>
		</svg>
	),

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
		__( 'premium', 'full-site-editing' ),
		/* translators: block keyword */
		__( 'paywall', 'full-site-editing' ),
	],
	edit,
	save,
	providesContext: {
		'premium-content/container/selectedPlanId': 'selectedPlanId',
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
