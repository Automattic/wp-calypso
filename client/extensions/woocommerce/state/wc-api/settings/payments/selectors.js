/**
 * Gets group of payment methods. (offline, off-site, on-site)
 *
 * @param {Object} state Global state tree
 * @param {Number} siteId wpcom site id
 * @param {String} type type of payment method
 * @return {Array} Array of Payment Methods
 */
export function getPaymentMethodsGroup( state, siteId, type ) {
	const wcApi = state.extensions.woocommerce.wcApi || {};
	const siteData = wcApi[ siteId ] || {};
	let methods;
	if ( ! Array.isArray( siteData.paymentMethods ) ) {
		methods = [];
	} else {
		methods = siteData.paymentMethods.filter( ( method ) => {
			return method.methodType === type;
		} );
	}
	return methods || [];
}
