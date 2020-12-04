/**
 * Internal dependencies
 */
import { GROUP_JETPACK } from 'calypso/lib/plans/constants';
import { planMatches } from 'calypso/lib/plans';

export function isJetpackPlanSlug( productSlug ) {
	return planMatches( productSlug, { group: GROUP_JETPACK } );
}
