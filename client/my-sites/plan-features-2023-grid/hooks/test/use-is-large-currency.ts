/**
 * @jest-environment jsdom
 */
/**
 * Default mock implementations
 */
jest.mock( 'react-redux', () => ( {
	...jest.requireActual( 'react-redux' ),
	useSelector: ( selector ) => selector(),
} ) );
jest.mock( 'calypso/state/plans/selectors', () => ( {
	getPlanPrices: jest.fn(),
} ) );
jest.mock( 'calypso/state/ui/selectors', () => ( {
	getSelectedSiteId: jest.fn( () => 1 ),
} ) );

import { PlanSlug, PLAN_FREE, PLAN_PERSONAL, PLAN_PREMIUM } from '@automattic/calypso-products';
import { getPlanPrices } from 'calypso/state/plans/selectors';
import useIsLargeCurrency from '../use-is-large-currency';

describe( 'useIsLargeCurrency', () => {
	const defaultProps = {
		planSlugs: [ PLAN_FREE, PLAN_PERSONAL, PLAN_PREMIUM ] as PlanSlug[],
	};

	beforeEach( () => {
		jest.clearAllMocks();
	} );

	test( 'should return false for small values', () => {
		getPlanPrices.mockImplementation( () => ( {
			rawPrice: 9000,
			discountedRawPrice: 5000,
			planDiscountedRawPrice: 7000,
		} ) );

		expect( useIsLargeCurrency( defaultProps ) ).toEqual( false );
	} );

	test( 'should return true for large values', () => {
		getPlanPrices.mockImplementation( () => ( {
			rawPrice: 900.01,
			discountedRawPrice: 500.01,
			planDiscountedRawPrice: 700.01,
		} ) );

		expect( useIsLargeCurrency( defaultProps ) ).toEqual( true );
	} );
} );
