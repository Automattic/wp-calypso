/** @format */
/**
 * External dependencies
 */
import { isPlainObject, values } from 'lodash';

/**
 * Internal dependencies
 */
import { getSiteOption } from 'state/sites/selectors';
import getSiteSetting from 'state/selectors/get-site-setting';

/**
 * Normalize API Settings
 *
 * @format
 * @param {Object} settings Raw API settings
 * @return {Object}          Normalized settings
 */

export function normalizeSettings( settings ) {
	return Object.keys( settings ).reduce( ( memo, key ) => {
		switch ( key ) {
			case 'default_category':
				memo[ key ] = parseInt( settings[ key ] );
				break;
			case 'sharing_show':
				if ( isPlainObject( settings[ key ] ) ) {
					memo[ key ] = values( settings[ key ] );
				} else {
					memo[ key ] = settings[ key ];
				}
				break;
			default:
				memo[ key ] = settings[ key ];
		}

		return memo;
	}, {} );
}

export const getDefaultSiteFrontPageSettings = ( state, siteId ) => {
	if ( getSiteSetting( state, siteId, 'show_on_front' ) ) {
		return {
			show_on_front: getSiteSetting( state, siteId, 'show_on_front' ),
			page_on_front: getSiteSetting( state, siteId, 'page_on_front' ),
			page_for_posts: getSiteSetting( state, siteId, 'page_for_posts' ),
		};
	}
	return {
		show_on_front: getSiteOption( state, siteId, 'show_on_front' ),
		page_on_front: getSiteOption( state, siteId, 'page_on_front' ),
		page_for_posts: getSiteOption( state, siteId, 'page_for_posts' ),
	};
};
