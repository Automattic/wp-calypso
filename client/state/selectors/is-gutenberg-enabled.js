/** @format */

/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { isEnabled } from 'config';
import getSiteOptions from 'state/selectors/get-site-options';
import isCalypsoifyGutenbergEnabled from 'state/selectors/is-calypsoify-gutenberg-enabled';
import isVipSite from 'state/selectors/is-vip-site';
import { isJetpackSite } from 'state/sites/selectors';
import versionCompare from 'lib/version-compare';

export const isGutenbergEnabled = ( state, siteId ) => {
	if ( ! siteId ) {
		return false;
	}

	if ( isCalypsoifyGutenbergEnabled( state, siteId ) ) {
		return true;
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

export default isGutenbergEnabled;
