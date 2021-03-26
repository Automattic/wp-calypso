// @ts-check

/**
 * External dependencies
 */
import { flatten } from 'lodash';

/**
 * @typedef RawPurchase
 * @type {object}
 * @property {boolean} [delayed_provisioning]
 * @property {boolean} [free_trial]
 * @property {boolean} [is_domain_registration]
 * @property {string} meta
 * @property {string|number} product_id
 * @property {string} product_slug
 * @property {string} product_type
 * @property {string} product_name
 * @property {string} product_name_short
 * @property {number} new_quantity
 * @property {string} [registrar_support_url]
 * @property {boolean} [is_email_verified]
 * @property {boolean} [is_root_domain_with_us]
 */

/**
 * @typedef RawFailedPurchase
 * @type {object}
 * @property {string} product_meta
 * @property {string|number} product_id
 * @property {string} product_slug
 * @property {string|number} product_cost
 * @property {string} product_name
 */

/**
 * @typedef Purchase
 * @type {object}
 * @property {boolean} delayedProvisioning
 * @property {boolean} freeTrial
 * @property {boolean} isDomainRegistration
 * @property {string} meta
 * @property {string|number} productId
 * @property {string} productSlug
 * @property {string} productType
 * @property {string} productName
 * @property {string} productNameShort
 * @property {string} registrarSupportUrl
 * @property {boolean} isEmailVerified
 * @property {boolean} isRootDomainWithUs
 */

/**
 * @typedef FailedPurchase
 * @type {object}
 * @property {string} meta
 * @property {string|number} productId
 * @property {string} productSlug
 * @property {string|number} productCost
 * @property {string} productName
 */

/**
 * @typedef RawReceiptData
 * @type {object}
 * @property {string} receipt_id
 * @property {string} display_price
 * @property {RawPurchases|string[]} purchases - will only be an array if it is empty
 * @property {RawFailedPurchases|string[]} failed_purchases - will only be an array if it is empty
 */

/* eslint-disable jsdoc/no-undefined-types */
/**
 * @typedef {Record<string, RawFailedPurchase[]>} RawFailedPurchases
 */

/**
 * @typedef {Record<string, RawPurchase[]>} RawPurchases
 */
/* eslint-enable jsdoc/no-undefined-types */

/**
 * @typedef ReceiptData
 * @type {object}
 * @property {string} receiptId
 * @property {string} displayPrice
 * @property {Purchase[]} purchases
 * @property {FailedPurchase[]} failedPurchases
 */

/**
 * Converts raw receipt data into receipt data
 *
 * @param {RawReceiptData} data The raw data returned from the server after a transaction
 * @returns {ReceiptData} The formatted receipt data
 */
export function createReceiptObject( data ) {
	return {
		receiptId: data.receipt_id,
		displayPrice: data.display_price,
		purchases: flattenPurchases( data.purchases || {} ).map( ( purchase ) => {
			return {
				delayedProvisioning: Boolean( purchase.delayed_provisioning ),
				freeTrial: purchase.free_trial,
				isDomainRegistration: Boolean( purchase.is_domain_registration ),
				meta: purchase.meta,
				productId: purchase.product_id,
				productSlug: purchase.product_slug,
				productType: purchase.product_type,
				productName: purchase.product_name,
				productNameShort: purchase.product_name_short,
				newQuantity: purchase.new_quantity,
				registrarSupportUrl: purchase.registrar_support_url,
				isEmailVerified: Boolean( purchase.is_email_verified ),
				isRootDomainWithUs: Boolean( purchase.is_root_domain_with_us ),
			};
		} ),
		failedPurchases: flattenFailedPurchases( data.failed_purchases || {} ).map( ( purchase ) => {
			return {
				meta: purchase.product_meta,
				productId: purchase.product_id,
				productCost: purchase.product_cost,
				productSlug: purchase.product_slug,
				productName: purchase.product_name,
			};
		} ),
	};
}

/**
 * Purchases are of the format { [siteId]: [ { productId: ... } ] }
 * so we need to flatten them to get a list of purchases
 *
 * @param {object} purchases keyed by siteId { [siteId]: [ { productId: ... } ] }
 * @returns {Array<RawPurchase>} of product objects [ { productId: ... }, ... ]
 */
function flattenPurchases( purchases ) {
	return flatten( Object.values( purchases ) );
}

/**
 * Purchases are of the format { [siteId]: [ { productId: ... } ] }
 * so we need to flatten them to get a list of purchases
 *
 * @param {object} purchases keyed by siteId { [siteId]: [ { productId: ... } ] }
 * @returns {Array<RawFailedPurchase>} of product objects [ { productId: ... }, ... ]
 */
function flattenFailedPurchases( purchases ) {
	return flatten( Object.values( purchases ) );
}
