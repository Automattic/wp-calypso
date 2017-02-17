/**
 * Creates config API with data applied.
 *
 * @param {Object} data Config data
 * @return {Function} Config API
 */
const createConfig = data => {
	/**
	 * Retrieves property from config by `key`.
	 * Throws an error if the requested `key` is not set in the config file.
	 *
	 * @param {String} key The key of the config entry.
	 * @return {*} Value of config or error if not found.
	 * @api public
	 */
	const config = key => {
		if ( key in data ) {
			return data[ key ];
		}
		throw new Error( 'config key `' + key + '` does not exist' );
	};

	/**
	 * Checks whether a specific feature is enabled.
	 *
	 * @param {String} feature Feature name
	 * @return {Boolean} True when feature is enabled.
	 * @api public
	 */
	config.isEnabled = feature => data.features && !! data.features[ feature ] || false;

	return config;
};

module.exports = createConfig;
