import { localizeUrl as _localizeUrl } from '@automattic/i18n-utils';
import i18n from 'i18n-calypso';

export function localizeUrl( fullUrl, locale = i18n.getLocaleSlug() ) {
	return _localizeUrl( fullUrl, locale );
}
