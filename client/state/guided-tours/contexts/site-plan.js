/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { isCurrentPlanPaid } from 'calypso/state/sites/selectors';

/**
 * Returns true if the selected site has a paid plan
 *
 * @param {object} state Global state tree
 * @returns {boolean} True if selected site is on a paid plan, false otherwise.
 */
export const isSelectedSitePlanPaid = ( state ) => {
	const siteId = getSelectedSiteId( state );
	return siteId ? isCurrentPlanPaid( state, siteId ) : false;
};

/**
 * Returns true if the selected site has a free plan.
 *
 * @param {object} state Global state tree
 * @returns {boolean} True if selected site is on a free plan, false otherwise.
 */
export const isSelectedSitePlanFree = ( state ) => {
	const siteId = getSelectedSiteId( state );
	return siteId ? ! isCurrentPlanPaid( state, siteId ) : false;
};
