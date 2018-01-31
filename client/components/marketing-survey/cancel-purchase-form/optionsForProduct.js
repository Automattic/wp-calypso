/** @format */

/**
 * Internal Dependencies
 */

import { isJetpackPlan } from 'lib/products-values';

export const cancellationOptionsForPurchase = purchase => {
	if ( isJetpackPlan( purchase ) ) {
		return [ 'couldNotActivate', 'didNotInclude', 'onlyNeedFree' ];
	}

	return [ 'couldNotInstall', 'tooHard', 'didNotInclude', 'onlyNeedFree' ];
};

export const nextAdventureOptionsForPurchase = purchase => {
	if ( isJetpackPlan( purchase ) ) {
		return [ 'stayingHere', 'otherPlugin', 'leavingWP', 'noNeed' ];
	}

	return [ 'stayingHere', 'otherWordPress', 'differentService', 'noNeed' ];
};
