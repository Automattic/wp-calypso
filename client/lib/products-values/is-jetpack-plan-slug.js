/**
 * Internal dependencies
 */
import { planMatches, GROUP_JETPACK } from '@automattic/calypso-products';

export function isJetpackPlanSlug( productSlug ) {
	return planMatches( productSlug, { group: GROUP_JETPACK } );
}
