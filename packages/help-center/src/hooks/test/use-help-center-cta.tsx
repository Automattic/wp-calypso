/**
 * @jest-environment jsdom
 */

import { renderHook } from '@testing-library/react';
import { useHelpCenterCTA } from '../use-help-center-cta';
import type { HelpCenterCTAVariant } from '../../components/help-center-cta';
import type { HelpCenterCTAData } from '../../types';

const mockUseFeatureConfig = jest.fn();
const mockUseHelpCenterCTAQuery = jest.fn();

jest.mock( '../../contexts/HelpCenterContext', () => ( {
	useFeatureConfig: () => mockUseFeatureConfig(),
} ) );

jest.mock( '../../data/use-help-center-cta', () => ( {
	useHelpCenterCTAQuery: ( enabled?: boolean ) => mockUseHelpCenterCTAQuery( enabled ),
} ) );

const bannerCta = {
	id: 'onboarding-call-v1',
	variant: 'banner',
	url: 'https://example.test/onboarding-call',
	title: 'Book Your Free Onboarding Call',
};

const setup = ( {
	enabled = true,
	isLoading = false,
	cta = bannerCta,
	variant = 'banner',
}: {
	enabled?: boolean;
	isLoading?: boolean;
	cta?: HelpCenterCTAData | null;
	variant?: HelpCenterCTAVariant;
} = {} ) => {
	mockUseFeatureConfig.mockReturnValue( { contextualCta: { enabled } } );
	mockUseHelpCenterCTAQuery.mockReturnValue( { data: cta, isLoading } );

	return renderHook( () => useHelpCenterCTA( variant ) );
};

describe( 'useHelpCenterCTA', () => {
	afterEach( () => {
		jest.clearAllMocks();
	} );

	it( 'maps the payload onto renderable props', () => {
		const { result } = setup();

		expect( result.current ).toEqual( {
			variant: 'banner',
			ctaId: 'onboarding-call-v1',
			url: bannerCta.url,
			title: bannerCta.title,
			description: undefined,
			actionLabel: undefined,
		} );
	} );

	it( 'passes through the optional description and link copy', () => {
		const { result } = setup( {
			cta: {
				...bannerCta,
				description: 'Talk one-on-one with a Happiness Engineer.',
				url_text: 'Book your free call',
			},
		} );

		expect( result.current ).toMatchObject( {
			description: 'Talk one-on-one with a Happiness Engineer.',
			actionLabel: 'Book your free call',
		} );
	} );

	it( 'maps the link-list item variant', () => {
		const { result } = setup( {
			cta: { ...bannerCta, variant: 'link-list-item' },
			variant: 'link-list-item',
		} );

		expect( result.current ).toMatchObject( { variant: 'link-list-item' } );
	} );

	it( 'only answers the slot the backend built the CTA for', () => {
		expect( setup( { variant: 'link-list-item' } ).result.current ).toBeNull();
		expect(
			setup( { cta: { ...bannerCta, variant: 'link-list-item' }, variant: 'banner' } ).result
				.current
		).toBeNull();
	} );

	it( 'renders in no slot at all for an unknown variant', () => {
		const unknown = { ...bannerCta, variant: 'default' };

		expect( setup( { cta: unknown, variant: 'banner' } ).result.current ).toBeNull();
		expect( setup( { cta: unknown, variant: 'link-list-item' } ).result.current ).toBeNull();
	} );

	it( 'returns null while the CTA is loading', () => {
		const { result } = setup( { isLoading: true } );

		expect( result.current ).toBeNull();
	} );

	it( 'returns null when the payload carries no cta', () => {
		const { result } = setup( { cta: null } );

		expect( result.current ).toBeNull();
	} );

	it( 'returns null when the payload is missing a title or a url', () => {
		expect( setup( { cta: { ...bannerCta, title: '' } } ).result.current ).toBeNull();
		expect( setup( { cta: { ...bannerCta, url: '' } } ).result.current ).toBeNull();
	} );

	it( 'returns null when the payload is missing an id', () => {
		expect( setup( { cta: { ...bannerCta, id: '' } } ).result.current ).toBeNull();
	} );

	it( 'returns null when the title is not a string', () => {
		const cta = {
			...bannerCta,
			title: [ 'Book Your Free Onboarding Call' ],
		} as unknown as HelpCenterCTAData;

		expect( setup( { cta } ).result.current ).toBeNull();
	} );

	it( 'renders the CTA without a description when it is not a string', () => {
		const cta = {
			...bannerCta,
			description: { text: 'Talk one-on-one with a Happiness Engineer.' },
		} as unknown as HelpCenterCTAData;

		const { result } = setup( { cta } );

		expect( result.current ).toMatchObject( { description: undefined } );
	} );

	it( 'refuses a destination that is not an http(s) url', () => {
		expect(
			setup( { cta: { ...bannerCta, url: 'javascript:alert(1)' } } ).result.current // eslint-disable-line no-script-url
		).toBeNull();
		expect(
			setup( { cta: { ...bannerCta, url: 'data:text/html,hi' } } ).result.current
		).toBeNull();
		expect( setup( { cta: { ...bannerCta, url: 'not a url' } } ).result.current ).toBeNull();
	} );

	it( 'refuses a relative destination', () => {
		expect( setup( { cta: { ...bannerCta, url: '/help/contact' } } ).result.current ).toBeNull();
	} );

	it( 'passes through purchased_at and plan_family, renamed to camelCase', () => {
		const { result } = setup( {
			cta: { ...bannerCta, purchased_at: 1234567890, plan_family: 'business' },
		} );

		expect( result.current ).toMatchObject( {
			purchasedAt: 1234567890,
			planFamily: 'business',
		} );
	} );

	it( 'drops purchased_at and plan_family when they are not of the right type', () => {
		const cta = {
			...bannerCta,
			purchased_at: 'yesterday',
			plan_family: 42,
		} as unknown as SupportStatus[ 'cta' ];

		const { result } = setup( { cta } );

		expect( result.current ).toMatchObject( {
			purchasedAt: undefined,
			planFamily: undefined,
		} );
	} );

	it( 'renders the CTA without purchasedAt or planFamily when they are absent from the payload', () => {
		const { result } = setup();

		expect( result.current ).toMatchObject( {
			purchasedAt: undefined,
			planFamily: undefined,
		} );
	} );

	it( 'returns null and asks the CTA query to stay disabled when the product disables it', () => {
		const { result } = setup( { enabled: false } );

		expect( result.current ).toBeNull();
		expect( mockUseHelpCenterCTAQuery ).toHaveBeenCalledWith( false );
	} );
} );
