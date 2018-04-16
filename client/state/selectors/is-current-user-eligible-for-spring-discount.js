/** @format */

/**
 * Internal dependencies
 */
import { abtest } from 'lib/abtest';
import { hasActivePromotion } from 'state/active-promotions/selectors';

/**
 * Returns info whether the site is eligible for spring discount or not.
 *
 * @param  {Object}  state Global state tree.
 * @return {bool}    Whether the site is eligible for spring discount or not.
 */
export default state => {
	// This is not super reliable but is fine for purposes of this test - display the
	// upsell until we hit a certain point in time
	const pastPromo = new Date() > new Date( Date.UTC( 2018, 3, 20, 23, 59, 59 ) );
	if ( pastPromo ) {
		return false;
	}

	if ( ! hasActivePromotion( state, 'spring_sale' ) ) {
		return false;
	}

	const variant = abtest( 'springSale30PercentOff' );
	if ( variant !== 'upsell' ) {
		return false;
	}

	return true;
};
