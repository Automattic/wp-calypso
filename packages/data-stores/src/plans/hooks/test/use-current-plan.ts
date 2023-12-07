// Mocks
jest.mock( '@wordpress/element', () => ( {
	useMemo: jest.fn( ( callback ) => callback() ),
} ) );

jest.mock( '../../queries/use-site-plans', () => jest.fn() );

import * as MockData from '../../mock';
import useSitePlans from '../../queries/use-site-plans';
import useCurrentPlan from '../use-current-plan';

describe( 'useCurrentPlan selector', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'should bring back current plan when one exists in Site Plans', () => {
		useSitePlans.mockImplementation( () => ( {
			data: {
				[ MockData.NEXT_STORE_SITE_PLAN_FREE.planSlug ]: MockData.NEXT_STORE_SITE_PLAN_FREE,
				[ MockData.NEXT_STORE_SITE_PLAN_BUSINESS_CURRENT.planSlug ]:
					MockData.NEXT_STORE_SITE_PLAN_BUSINESS_CURRENT,
			},
		} ) );

		const currentPlan = useCurrentPlan( { siteId: 1 } );

		expect( currentPlan ).toEqual( MockData.NEXT_STORE_SITE_PLAN_BUSINESS_CURRENT );
	} );

	it( 'should bring back undefined if no current plan exists in Site Plans', () => {
		useSitePlans.mockImplementation( () => ( {
			data: {
				[ MockData.NEXT_STORE_SITE_PLAN_FREE.planSlug ]: MockData.NEXT_STORE_SITE_PLAN_FREE,
				[ MockData.NEXT_STORE_SITE_PLAN_BUSINESS.planSlug ]: MockData.NEXT_STORE_SITE_PLAN_BUSINESS,
			},
		} ) );

		const currentPlan = useCurrentPlan( { siteId: 1 } );

		expect( currentPlan ).toEqual( undefined );
	} );
} );
