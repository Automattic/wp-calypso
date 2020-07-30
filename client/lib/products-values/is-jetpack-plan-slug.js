/**
 * Internal dependencies
 */
import { GROUP_JETPACK } from 'lib/plans/constants';
import { planMatches } from 'lib/plans';

export function isJetpackPlanSlug( productSlug ) {
	return planMatches( productSlug, { group: GROUP_JETPACK } );
}
