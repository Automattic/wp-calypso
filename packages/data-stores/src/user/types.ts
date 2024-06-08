import * as selectors from './selectors';
import type { ActionCreators } from './actions';
import type { SelectFromMap } from '../mapped-types';

export interface AuthRedirectParams {
	oauth2_client_id?: string | null;
	oauth2_redirect?: string | null;
	redirect_to?: string | null;
	/**
	 *  url sent in the confirmation email
	 */
	jetpack_redirect?: string | null;
}

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
	 */
	localeSlug: string;

	/**
	 * The user's locale variant, e.g. `es-mx`.
	 * If there is no variant, `""` empty string is returned.
	 */
	locale_variant: string;

	/**
	 * The bootstrapped user's locale variant, e.g. `es-mx`.
	 */
	localeVariant: string;

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
