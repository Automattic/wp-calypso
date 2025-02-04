// Mocks
jest.mock( '@wordpress/element', () => ( {
	useMemo: jest.fn( ( callback ) => callback() ),
} ) );

jest.mock( '../../queries/use-site-plans', () => jest.fn() );
jest.mock( '../../queries/use-plans', () => jest.fn() );

import * as MockData from '../../mock';
import usePlans from '../../queries/use-plans';
import useSitePlans from '../../queries/use-site-plans';
import useIntroOffers from '../use-intro-offers';

describe( 'useIntroOffers selector', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'should give precedence to intro offers defined on SitePlans over Plans', () => {
		useSitePlans.mockImplementation( () => ( {
			data: {
				[ MockData.NEXT_STORE_SITE_PLAN_BUSINESS.planSlug ]: MockData.NEXT_STORE_SITE_PLAN_BUSINESS, // intro offer (takes precedence)
			},
		} ) );
		usePlans.mockImplementation( () => ( {
			data: {
				[ MockData.NEXT_STORE_PLAN_BUSINESS.planSlug ]: MockData.NEXT_STORE_PLAN_BUSINESS, // intro offer
			},
		} ) );

		const introOffers = useIntroOffers( { siteId: 1, coupon: undefined } );

		expect( introOffers ).toEqual( {
			[ MockData.NEXT_STORE_SITE_PLAN_BUSINESS.planSlug ]:
				MockData.NEXT_STORE_SITE_PLAN_BUSINESS.pricing.introOffer,
		} );
	} );

	it( 'should bring back null if no intro offer defined', () => {
		useSitePlans.mockImplementation( () => ( {
			data: {
				[ MockData.NEXT_STORE_SITE_PLAN_PERSONAL.planSlug ]: MockData.NEXT_STORE_SITE_PLAN_PERSONAL, // no intro offer
			},
		} ) );
		usePlans.mockImplementation( () => ( {
			data: {
				[ MockData.NEXT_STORE_PLAN_PERSONAL.planSlug ]: MockData.NEXT_STORE_PLAN_PERSONAL, // no intro offer
			},
		} ) );

		const introOffers = useIntroOffers( { siteId: 1, coupon: undefined } );

		expect( introOffers ).toEqual( {
			[ MockData.NEXT_STORE_SITE_PLAN_PERSONAL.planSlug ]: null,
		} );
	} );

	it( 'should bring back correct intro offer if only defined on Plans', () => {
		useSitePlans.mockImplementation( () => ( {
			data: {},
		} ) );
		usePlans.mockImplementation( () => ( {
			data: {
				[ MockData.NEXT_STORE_PLAN_BUSINESS.planSlug ]: MockData.NEXT_STORE_PLAN_BUSINESS,
			},
		} ) );

		const introOffers = useIntroOffers( { siteId: 1, coupon: undefined } );

		expect( introOffers ).toEqual( {
			[ MockData.NEXT_STORE_PLAN_BUSINESS.planSlug ]:
				MockData.NEXT_STORE_PLAN_BUSINESS.pricing.introOffer,
		} );
	} );

	it( 'should bring back union of intro offers (or null) from SitePlans and Plans, with SitePlans taking precedence when defined', () => {
		useSitePlans.mockImplementation( () => ( {
			data: {
				[ MockData.NEXT_STORE_SITE_PLAN_BUSINESS.planSlug ]: MockData.NEXT_STORE_SITE_PLAN_BUSINESS, // intro offer (takes precedence)
			},
		} ) );
		usePlans.mockImplementation( () => ( {
			data: {
				[ MockData.NEXT_STORE_PLAN_PERSONAL.planSlug ]: MockData.NEXT_STORE_PLAN_PERSONAL, // no intro offer
				[ MockData.NEXT_STORE_PLAN_BUSINESS.planSlug ]: MockData.NEXT_STORE_PLAN_BUSINESS, // intro offer
			},
		} ) );

		const introOffers = useIntroOffers( { siteId: 1, coupon: undefined } );

		expect( introOffers ).toEqual( {
			[ MockData.NEXT_STORE_PLAN_PERSONAL.planSlug ]: null,
			[ MockData.NEXT_STORE_SITE_PLAN_BUSINESS.planSlug ]:
				MockData.NEXT_STORE_SITE_PLAN_BUSINESS.pricing.introOffer,
		} );
	} );
} );
