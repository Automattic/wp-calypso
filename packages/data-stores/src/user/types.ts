import * as selectors from './selectors';
import type { ActionCreators } from './actions';
import type { SelectFromMap } from '../mapped-types';
export interface CurrentUser {
	ID: number;
	display_name: string;
	username: string;
	email: string;
	/**
	 * The user's locale slug, e.g. `es`.
	 */
	language: string;

	/**
	 * The bootstraped user's locale slug, e.g. `es`.
	 * @deprecated Use `language` instead.
	 */
	localeSlug?: string;

	/**
	 * The user's locale variant, e.g. `es-mx`.
	 * If there is no variant, `""` empty string is returned.
	 */
	locale_variant: string;

	/**
	 * The bootstrapped user's locale variant, e.g. `es-mx`.
	 * @deprecated Use `locale_variant` instead.
	 */
	localeVariant?: string;

	/**
	 * The user's existing sites count.
	 */
	site_count: number;

	/**
	 * The subkey for Subscription Management
	 */
	subscriptionManagementSubkey?: string;
}

export type UserSelect = SelectFromMap< typeof selectors >;
export type UserActions = ActionCreators;
