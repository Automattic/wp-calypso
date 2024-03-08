import { isSiteOnHostingTrial, isSiteOnMigrationTrial } from '..';
import type { AppState } from 'calypso/types';

/**
 * Checks whether the current site is on any type of Business trial.
 * @param {AppState} state Global state tree
 * @param {number} siteId - Site ID
 * @returns {boolean} Returns true if the site is on a Business trial
 */
export default function isSiteOnBusinessTrial( state: AppState, siteId: number ): boolean {
	return isSiteOnMigrationTrial( state, siteId ) || isSiteOnHostingTrial( state, siteId );
}
