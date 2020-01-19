/**
 * External dependencies
 */
import { ActionsDefinedInModule } from '@automattic/data-stores';

/**
 * Internal dependencies
 */
import * as Actions from './actions';

enum ActionType {
	RESET_SITE_TYPE = 'RESET_SITE_TYPE',
	SET_DOMAIN = 'SET_DOMAIN',
	SET_SELECTED_DESIGN = 'SET_SELECTED_DESIGN',
	SET_SITE_TITLE = 'SET_SITE_TITLE',
	SET_SITE_TYPE = 'SET_SITE_TYPE',
	SET_SITE_VERTICAL = 'SET_SITE_VERTICAL',
	RESET_SITE_VERTICAL = 'RESET_SITE_VERTICAL',
	TOGGLE_PAGE_LAYOUT = 'TOGGLE_PAGE_LAYOUT',
}
export { ActionType };

export type OnboardAction = ActionsDefinedInModule< typeof Actions >;

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
