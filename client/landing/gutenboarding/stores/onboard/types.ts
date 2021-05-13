export interface SiteVertical {
	/**
	 * Vertical ID. Can be undefined for user-specified verticals that don't exist in WP.com's curated list.
	 *
	 * @example
	 * p2v19
	 */
	id?: string;

	/**
	 * Vertical Label. Either obtained from WP.com, or specified by the user.
	 *
	 * @example
	 * Christmas Tree Farm
	 */
	label: string;

	/**
	 * Untranslated Vertical Label. Obtained from WP.com.
	 *
	 * @example
	 * Christmas Tree Farm
	 */
	slug?: string;
}
