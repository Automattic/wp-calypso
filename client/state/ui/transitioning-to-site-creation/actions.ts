import { TRANSITIONING_TO_SITE_CREATION_SET } from 'calypso/state/action-types';

import 'calypso/state/ui/init';

export function setTransitioningToSiteCreation( isTransitioning: boolean ) {
	return {
		type: TRANSITIONING_TO_SITE_CREATION_SET,
		isTransitioning,
	} as const;
}
