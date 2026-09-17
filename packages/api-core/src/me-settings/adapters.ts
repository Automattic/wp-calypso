import { decodeEntities } from '@wordpress/html-entities';

/**
 * Normalize a `/me/settings` payload for client-side consumers.
 *
 * `avatar_URL` query arguments are separated by `&amp;` sequences instead
 * of the usual `&` seperators. See 226594-ghe-Automattic/wpcom for why
 * this is.
 */
export function adaptUserSettings< T extends { avatar_URL?: string } >( settings: T ): T {
	if ( ! settings.avatar_URL ) {
		return settings;
	}
	return { ...settings, avatar_URL: decodeEntities( settings.avatar_URL ) };
}
