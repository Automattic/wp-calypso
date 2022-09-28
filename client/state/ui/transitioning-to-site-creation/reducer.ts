import { TRANSITIONING_TO_SITE_CREATION_SET } from 'calypso/state/action-types';
import type { Reducer } from 'redux';

const transitioningToSiteCreation: Reducer< boolean > = (
	state = false,
	{ type, isTransitioning }
) => {
	if ( type === TRANSITIONING_TO_SITE_CREATION_SET ) {
		return isTransitioning;
	}
	return state;
};

export default transitioningToSiteCreation;
