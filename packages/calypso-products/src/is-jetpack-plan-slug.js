/**
 * Internal dependencies
 */
import { planMatches } from './main';
import { GROUP_JETPACK } from './constants';

export function isJetpackPlanSlug( productSlug ) {
	return planMatches( productSlug, { group: GROUP_JETPACK } );
}
