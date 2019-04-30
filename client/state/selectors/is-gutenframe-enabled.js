/** @format */
/**
 * Internal dependencies
 */
import { isEnabled } from 'config';
import isVipSite from 'state/selectors/is-vip-site';
import { isJetpackSite } from 'state/sites/selectors';
import versionCompare from '../../lib/version-compare';
import { get } from 'lodash';
import getSiteOptions from './get-site-options';

export const isGutenframeEnabled = ( state, siteId ) => {
	if ( ! siteId ) {
		return false;
	}

	if ( isEnabled( 'jetpack/gutenframe' ) ) {
		if (
			versionCompare(
				get( getSiteOptions( state, siteId ), 'jetpack_version', 0 ),
				'7.3-alpha',
				'>='
			)
		) {
			return isEnabled( 'gutenberg' ) && ! isVipSite( state, siteId );
		}
	}

	return (
		isEnabled( 'gutenberg' ) && ! isJetpackSite( state, siteId ) && ! isVipSite( state, siteId )
	);
};

export default isGutenframeEnabled;
