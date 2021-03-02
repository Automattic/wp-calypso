/**
 * Internal dependencies
 */
import { PLAN_MONTHLY_PERIOD } from 'calypso/lib/plans/constants';
import { assertValidProduct } from 'calypso/lib/products-values/utils/assert-valid-product';
import { formatProduct } from 'calypso/lib/products-values/format-product';
import { dangerouslyGetExperimentAssignment } from 'calypso/lib/explat';

export function isMonthly( rawProduct ) {
	const product = formatProduct( rawProduct );
	assertValidProduct( product );

	// Temporary Experiment testing the new ExPlat client
	try {
		dangerouslyGetExperimentAssignment( 'explat_test_aa_calypso_boot' );
	} catch ( e ) {
		// Do nothing
	}

	return parseInt( product.bill_period, 10 ) === PLAN_MONTHLY_PERIOD;
}
