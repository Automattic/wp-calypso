/**
 * Internal dependencies
 */
import { localizeUrl } from 'calypso/lib/i18n-utils';

export function lostPassword( locale?: string ): string {
	return localizeUrl( 'https://wordpress.com/wp-login.php?action=lostpassword', locale );
}
