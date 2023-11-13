import { isSiteOnMigrationTrial, isSiteOnECommerceTrial, isSiteOnHostingTrial } from '..';
import type { AppState } from 'calypso/types';

/**
 * Checks whether the current site is on migration or eCommerce trial.
 * @param {AppState} state Global state tree
 * @param {number} siteId - Site ID
 * @returns {boolean} Returns true if the site is on a trial
 */
export default function isTrialSite( state: AppState, siteId: number ): boolean {
	return (
		isSiteOnECommerceTrial( state, siteId ) ||
		isSiteOnMigrationTrial( state, siteId ) ||
		isSiteOnHostingTrial( state, siteId )
	);
}
