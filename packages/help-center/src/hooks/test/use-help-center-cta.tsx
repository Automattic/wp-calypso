/**
 * @jest-environment jsdom
 */

import { renderHook } from '@testing-library/react';
import { useHelpCenterCTA } from '../use-help-center-cta';
import type { SupportStatus } from '../../types';
import type { HelpCenterCTAPlacement } from '../use-help-center-cta';

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
	placement: 'help-center-home',
	url: 'https://savvycal.com/CustomerExperience/wordpresscom-onboarding-hc',
	title: 'Book Your Free Onboarding Call',
};

const setup = ( {
	enabled = true,
	isLoading = false,
	cta = bannerCta,
	placement = 'help-center-home',
}: {
	enabled?: boolean;
	isLoading?: boolean;
	cta?: SupportStatus[ 'cta' ] | null;
	placement?: HelpCenterCTAPlacement;
} = {} ) => {
	mockUseFeatureConfig.mockReturnValue( { contextualCta: { enabled } } );
	mockUseSupportStatus.mockReturnValue( { data: cta ? { cta } : {}, isLoading } );

	return renderHook( () => useHelpCenterCTA( placement ) );
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

	it( 'passes through the optional description and action label', () => {
		const { result } = setup( {
			cta: {
				...bannerCta,
				description: 'Talk one-on-one with a Happiness Engineer.',
				action_label: 'Book your free call',
			},
		} );

		expect( result.current ).toMatchObject( {
			description: 'Talk one-on-one with a Happiness Engineer.',
			actionLabel: 'Book your free call',
		} );
	} );

	it( 'only answers the slot the backend placed the CTA in', () => {
		expect( setup( { placement: 'help-center-more-resources' } ).result.current ).toBeNull();

		const listCta = {
			...bannerCta,
			variant: 'link-list-item',
			placement: 'help-center-more-resources',
		};

		expect( setup( { cta: listCta, placement: 'help-center-home' } ).result.current ).toBeNull();
		expect(
			setup( { cta: listCta, placement: 'help-center-more-resources' } ).result.current
		).toMatchObject( { variant: 'link-list-item', placement: 'help-center-more-resources' } );
	} );

	it( 'returns null for a variant the slot cannot render', () => {
		const { result } = setup( {
			cta: { ...bannerCta, placement: 'help-center-more-resources' },
			placement: 'help-center-more-resources',
		} );

		expect( result.current ).toBeNull();
	} );

	it( 'returns null while support status is loading', () => {
		const { result } = setup( { isLoading: true } );

		expect( result.current ).toBeNull();
	} );

	it( 'returns null when the payload carries no cta', () => {
		const { result } = setup( { cta: null } );

		expect( result.current ).toBeNull();
	} );

	it( 'returns null for an unknown variant', () => {
		const { result } = setup( { cta: { ...bannerCta, variant: 'default' } } );

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
