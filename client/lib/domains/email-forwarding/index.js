/**
 * Internal dependencies
 */
import { isBusiness } from 'lib/products-values';

function emailForwardingPlanLimit( plan ) {
	return ( isBusiness( plan ) ? 100 : 5 );
}

module.exports = { emailForwardingPlanLimit };
