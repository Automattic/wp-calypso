/**
 * Internal dependencies
 */
import { planMatches, GROUP_JETPACK } from './index';

export function isJetpackPlanSlug( productSlug ) {
	return planMatches( productSlug, { group: GROUP_JETPACK } );
}
