import { englishLocales } from '@automattic/i18n-utils';
import getCurrentLocaleSlug from 'calypso/state/selectors/get-current-locale-slug';
import isSiteWpcomAtomic from 'calypso/state/selectors/is-site-wpcom-atomic';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getCanonicalTheme } from 'calypso/state/themes/selectors/get-canonical-theme';
import 'calypso/state/themes/init';
import type { AppState } from 'calypso/types';

/**
 * Returns whether the activation modal makes sense for this theme on this
 * site. Callers fall through to direct activation when this returns false.
 *
 * Conditions:
 * - Site is not Atomic and not Jetpack: `/theme-headstart` only exists on
 *   Simple sites, so the "full setup" choice wouldn't apply elsewhere.
 * - Theme has `supports_theme_switch_headstart`: server-side opt-in that the
 *   theme has headstart content to install on full activation.
 * - User's locale is English: temporary gate while modal copy translations
 *   land and while content produced by the full-setup path is still not
 *   reliably translated. Remove once both are resolved.
 */
export function shouldShowActivationModal(
	state: AppState,
	siteId: number,
	themeId: string
): boolean {
	const theme = getCanonicalTheme( state, siteId, themeId );
	const isAtomic = !! isSiteWpcomAtomic( state, siteId );
	const isJetpack = !! isJetpackSite( state, siteId );
	const localeSlug = getCurrentLocaleSlug( state );
	const isEnglish = ! localeSlug || englishLocales.includes( localeSlug );
	return ! isAtomic && ! isJetpack && !! theme?.supports_theme_switch_headstart && isEnglish;
}
