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

import { PLAN_PREMIUM } from '@automattic/calypso-products';
import { getPlanPrices } from 'calypso/state/plans/selectors';
import usePlanPrices from '../hooks/use-plan-prices';

describe( 'usePlanPrices', () => {
	const defaultProps = {
		planSlug: PLAN_PREMIUM,
		returnMonthly: true,
	} as const;

	beforeEach( () => {
		jest.clearAllMocks();
	} );

	test( 'should return correct pricing structure', () => {
		getPlanPrices.mockImplementation( () => ( {
			rawPrice: 300,
			discountedRawPrice: 200,
			planDiscountedRawPrice: 100,
		} ) );

		const planPrices = usePlanPrices( defaultProps );

		expect( planPrices ).toEqual( {
			rawPrice: 300,
			discountedRawPrice: 200,
			planDiscountedRawPrice: 100,
		} );
	} );
} );
