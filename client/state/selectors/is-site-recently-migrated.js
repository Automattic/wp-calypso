/**
 * External dependencies
 */
import { get } from 'lodash';
import moment from 'moment';

/**
 * Internal dependencies
 */
import getRawSite from 'state/selectors/get-raw-site';

/**
 * Returns true if someone has recently migrated another WordPress site
 * into this one.
 *
 * @param {object} state Global state tree
 * @param {object} siteId Site ID
 * @returns {boolean} True if site has recently been the target of a migration
 */
export default function isSiteRecentlyMigrated( state, siteId ) {
	const site = getRawSite( state, siteId );
	const siteMigrationMeta = get( site, 'site_migration', {} );
	const status = get( siteMigrationMeta, 'status' );
	const lastModified = get( siteMigrationMeta, 'last_modified' );

	if ( ! status || ! lastModified ) {
		return false;
	}

	if ( 'done' === status ) {
		const lastModMoment = moment( lastModified );
		if ( moment().diff( lastModMoment, 'days' ) <= 2 ) {
			return true;
		}
	}

	return false;
}
