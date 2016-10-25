/** @ssr-ready **/

/**
 * External dependencies
 */
import startsWith from 'lodash/startsWith';

export const oldShowcaseUrl = '//wordpress.com/themes/';

export function isPremiumTheme( theme ) {
	if ( ! theme ) {
		return false;
	}

	if ( theme.stylesheet && startsWith( theme.stylesheet, 'premium/' ) ) {
		return true;
	}
	// The /v1.1/sites/:site_id/themes/mine endpoint (which is used by the
	// current-theme reducer, selector, and component) does not return a
	// `stylesheet` attribute. However, it does return a `cost` field (which
	// contains the correct price even if the user has already purchased that
	// theme, or if they have an upgrade that includes all premium themes).
	return !! ( theme.cost && theme.cost.number );
}
