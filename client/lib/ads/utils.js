/**
 * Internal dependencies
 */
import config from 'config';

module.exports = {

	/**
	 * Returns true if the site has WordAds access
	 * @param  {Site} site Site object
	 * @return {boolean}      true if site has WordAds access
	 */
	canAccessWordads: site => {
		if ( config.isEnabled( 'manage/ads' ) ) {
			return site.options &&
				site.options.wordads &&
				site.user_can_manage &&
				( ! site.jetpack || config.isEnabled( 'manage/ads/jetpack' ) );
		}

		return false;
	}
}
