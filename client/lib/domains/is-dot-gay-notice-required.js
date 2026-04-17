/**
 * Checks whether purchasing the given domain product requires displaying a .gay TLD notice.
 * The .gay registry policy requires registrars to inform buyers that the domain must be
 * used for LGBTQ+ affirming purposes; misuse can result in domain suspension.
 * @param {string} productSlug - the product slug to check
 * @param {Object} productsList - map of product slugs to product data objects
 * @returns {boolean} - true if the .gay usage notice must be shown at purchase time
 */
export function isDotGayNoticeRequired( productSlug, productsList ) {
	const product = productsList[ productSlug ] || {};
	return product?.is_dot_gay_notice_required ?? false;
}
