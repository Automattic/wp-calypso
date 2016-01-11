/**
 * Internal dependencies
 */

import { getABTestVariation } from 'lib/abtest';

function isInFreeTrialTest() {
	if ( getABTestVariation( 'freeTrials' ) === 'offered' ) {
		return true;
	}

	return false;
}

module.exports = {
	isInFreeTrialTest
};
