/**
 * Internal dependencies
 */

/**
 * Check if the argument is the slug of a secondary Jetpack site, in the form
 * domain.name::site.
 *
 * @example
 * // returns true
 * isJetpackSecondarySiteSlug( 'past-rat.jurassic.ninja::test' );
 * // returns true
 * isJetpackSecondarySiteSlug( 'example.com::test' );
 * // returns false
 * isJetpackSecondarySiteSlug( 'past-rat.jurassic.ninja' );
 * // returns false
 * isJetpackSecondarySiteSlug( 'https://past-rat.jurassic.ninja::test' );
 *
 * @param {string} slug Slug to test
 * @returns {boolean} True if it is
 */
export default function isJetpackSecondarySiteSlug( slug: string ): boolean {
	return /^([a-zA-Z0-9-]+\.?)+[a-zA-Z]+::[a-zA-Z0-9-]+$/.test( slug );
}
