/**
 * This function abstracts the logic for the "Woo DNA" Jetpack flow. The Woo DNA flow is an exclusively Woo-branded
 * Jetpack connection flow. It's meant to be used by Woo extensions or services with the Jetpack Connection package.
 * Because the user may have never heard of Jetpack, and hasn't installed Jetpack in their site, it's important to
 * not fill the flow with potentially confusing Jetpack branding.
 * @param query {Object} Map with the querystring parameters of the current page.
 * @returns An object with helper functions that are documented below.
 */
export default ( query ) =>
	Object.freeze( {
		/**
		 * @returns {boolean} Whether the current flow is "Woo DNA" or not.
		 */
		isWooDnaFlow: () => Boolean( query && query.woodna_service_name ),

		/**
		 * @returns {string} Flow name to send to the WP.com server to store in the newly created user metadata.
		 */
		getFlowName: () => 'woodna:' + query.from,

		/**
		 * @returns {string} Name of the service/plugin the user is signing up for. For example, "WooPayments".
		 */
		getServiceName: () =>
			query.woodna_service_name === 'WooCommerce Payments'
				? 'WooPayments'
				: query.woodna_service_name,

		/**
		 * @returns {string} URL with help about connecting Jetpack.
		 */
		getServiceHelpUrl: () => query.woodna_help_url,
	} );
