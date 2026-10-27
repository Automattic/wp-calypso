/**
 * @jest-environment jsdom
 */
import { TERM_ANNUALLY, TERM_MONTHLY } from '@automattic/calypso-products';
import { ITEM_TYPE_PLAN } from '../../../constants';
import { isUpgradeableToYearly } from '../use-store-item-info';
import type { SelectorProduct } from '../../../types';

const monthlyPlan = ( productSlug: string ) =>
	( { productSlug, term: TERM_MONTHLY, type: ITEM_TYPE_PLAN } ) as SelectorProduct;

describe( 'isUpgradeableToYearly', () => {
	it( 'offers the yearly term while it is on sale', () => {
		expect(
			isUpgradeableToYearly(
				monthlyPlan( 'jetpack_complete_monthly' ),
				TERM_ANNUALLY,
				( slug ) => slug === 'jetpack_complete'
			)
		).toBe( true );
	} );

	it.each( [ 'jetpack_growth_monthly', 'jetpack_security_t1_monthly' ] )(
		'does not offer a retired yearly term to a %s owner',
		( productSlug ) => {
			expect(
				isUpgradeableToYearly( monthlyPlan( productSlug ), TERM_ANNUALLY, () => false )
			).toBe( false );
		}
	);
} );
