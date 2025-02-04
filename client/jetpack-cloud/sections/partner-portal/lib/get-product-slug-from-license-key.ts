/**
 * Given a license key, returns the product slug associated with it. If the key
 * is empty or incorrectly formatted, returns null.
 * @param key A full license key string
 * @returns The product slug that corresponds to the given key string
 */
const getProductSlugFromLicenseKey = ( key?: string | null ) => {
	if ( ! key ) {
		return null;
	}

	// Here we rely on the assumption that license keys all follow the same
	// pattern: <productslug>_<uniquekey>
	//
	// It's important to note that the `<productslug>` *may* contain
	// underscores but doesn't always, so it's not safe to say,
	// e.g., key.split( '_' )[ 0 ].
	//
	// Examples (with unique keys obfuscated):
	// - jetpack_security_daily_000AA0a0aaaaaaAa0AaAaa0Aa
	// - jetpack_security_t1_yearly_A000aaaAa0aaA0AAaaAaAA0Aa
	const lastUnderscoreIndex = key.lastIndexOf( '_' );
	if ( lastUnderscoreIndex < 0 ) {
		return null;
	}

	return key.substring( 0, lastUnderscoreIndex );
};

export default getProductSlugFromLicenseKey;
