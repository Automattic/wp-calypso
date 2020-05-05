/**
 * This function maps the API address to the view address format. The AddressView
 * component expects the address in a slightly different format than the WC API
 * responds with.
 * See http://woocommerce.github.io/woocommerce-rest-api-docs/#order-billing-properties
 *
 * @param {object} address The address as returned from the remote site API
 * @returns {object} An object with keys matching the expected AddressView props
 */
const getAddressViewFormat = ( address ) => {
	return {
		street: address.address_1 || '',
		street2: address.address_2 || '',
		city: address.city || '',
		state: address.state || '',
		country: address.country || '',
		postcode: address.postcode || '',
	};
};

export default getAddressViewFormat;
