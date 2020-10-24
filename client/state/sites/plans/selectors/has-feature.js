/**
 * Internal dependencies
 */
import { planHasFeature } from 'calypso/lib/plans';
import { getSitePlanSlug } from 'calypso/state/sites/plans/selectors/get-site-plan-slug';

/**
 * Whether a site's current plan includes a given feature
 *
 * DO NOT USE THIS FOR FEATURE GATES, this is only to be used for deciding
 * if nudge should be shown.
 * If you want a feature gate, you should make it backend-side.
 *
 * @param  {object}  state   Global State tree
 * @param  {number}  siteId  Site ID
 * @param  {string}  feature The feature we're looking for
 * @returns {boolean}         True if the site's current plan includes the feature
 */
export function hasFeature( state, siteId, feature ) {
	return planHasFeature( getSitePlanSlug( state, siteId ), feature );
}
