enum ActionType {
	SET_DOMAIN = 'SET_DOMAIN',
	SET_SELECTED_DESIGN = 'SET_SELECTED_DESIGN',
	SET_SITE_TITLE = 'SET_SITE_TITLE',
	SET_SITE_TYPE = 'SET_SITE_TYPE',
	SET_SITE_VERTICAL = 'SET_SITE_VERTICAL',
	RESET_SITE_VERTICAL = 'RESET_SITE_VERTICAL',
	TOGGLE_PAGE_LAYOUT = 'TOGGLE_PAGE_LAYOUT',
	SET_SHOULD_CREATE = 'SET_SHOULD_CREATE',
	SET_IS_SITE_CREATED = 'SET_IS_SITE_CREATED',
	RESET_ONBOARD_STORE = 'RESET_ONBOARD_STORE',
}
export { ActionType };

export interface SiteVertical {
	/**
	 * Vertical Label. Either obtained from WP.com, or specified by the user.
	 *
	 * @example
	 * Christmas Tree Farm
	 */
	label: string;

	/**
	 * Vertical ID. Can be undefined for user-specified verticals that don't exist in WP.com's curated list.
	 *
	 * @example
	 * p2v19
	 */
	id?: string;
}
