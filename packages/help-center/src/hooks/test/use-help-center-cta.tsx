/**
 * @jest-environment jsdom
 */

import { renderHook } from '@testing-library/react';
import { useHelpCenterCTA } from '../use-help-center-cta';
import type { HelpCenterCTAVariant } from '../../components/help-center-cta';
import type { SupportStatus } from '../../types';

const mockUseFeatureConfig = jest.fn();
const mockUseSupportStatus = jest.fn();

jest.mock( '../../contexts/HelpCenterContext', () => ( {
	useFeatureConfig: () => mockUseFeatureConfig(),
} ) );

jest.mock( '../../data/use-support-status', () => ( {
	useSupportStatus: ( enabled?: boolean ) => mockUseSupportStatus( enabled ),
} ) );

const bannerCta = {
	id: 'onboarding-call-v1',
	variant: 'banner',
	url: 'https://savvycal.com/CustomerExperience/wordpresscom-onboarding-hc',
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
	cta?: SupportStatus[ 'cta' ] | null;
	variant?: HelpCenterCTAVariant;
} = {} ) => {
	mockUseFeatureConfig.mockReturnValue( { contextualCta: { enabled } } );
	mockUseSupportStatus.mockReturnValue( { data: cta ? { cta } : {}, isLoading } );

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
			placement: 'help-center-home',
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

	it( 'reports the link-list item against the More resources placement', () => {
		const { result } = setup( {
			cta: { ...bannerCta, variant: 'link-list-item' },
			variant: 'link-list-item',
		} );

		expect( result.current ).toMatchObject( {
			variant: 'link-list-item',
			placement: 'help-center-more-resources',
		} );
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

	it( 'returns null while support status is loading', () => {
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

	it( 'skips the CTA and the support-status fetch when the product disables it', () => {
		const { result } = setup( { enabled: false } );

		expect( result.current ).toBeNull();
		expect( mockUseSupportStatus ).toHaveBeenCalledWith( false );
	} );
} );
