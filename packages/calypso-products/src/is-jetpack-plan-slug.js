import { GROUP_JETPACK } from './constants';
import { planMatches } from './main';

export function isJetpackPlanSlug( productSlug ) {
	return planMatches( productSlug, { group: GROUP_JETPACK } );
}
