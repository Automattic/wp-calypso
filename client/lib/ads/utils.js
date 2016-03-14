/**
 * Internal dependencies
 */
import config from 'config';
import { userCan } from 'lib/site/utils';

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
				userCan( 'manage_options', site ) &&
				( ! site.jetpack || config.isEnabled( 'manage/ads/jetpack' ) );
		}

		return false;
	}
}
