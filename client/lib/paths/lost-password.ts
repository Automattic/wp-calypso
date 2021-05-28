/**
 * Internal dependencies
 */
import { localizeUrl } from 'calypso/lib/i18n-utils';

type LostPasswordOptions = {
	locale?: string;
};

export function lostPassword( { locale }: LostPasswordOptions = {} ): string {
	return localizeUrl( 'https://wordpress.com/wp-login.php?action=lostpassword', locale );
}
