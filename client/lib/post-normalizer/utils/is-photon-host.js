/**
 * Checks whether a hostname belongs to the Photon image CDN (i0.wp.com,
 * i1.wp.com, or i2.wp.com).
 *
 * @param {string} hostname - The hostname to test.
 * @returns {boolean} `true` if the hostname is a Photon CDN host, `false` otherwise.
 */
export function isPhotonHost( hostname ) {
	return /^i[0-2]\.wp\.com$/.test( hostname );
}
