/**
 * @jest-environment jsdom
 */

import { renderHook } from '@testing-library/react';
import { useHelpCenterCTA } from '../use-help-center-cta';
import type { SupportStatus } from '../../types';

const mockUseFeatureConfig = jest.fn();
const mockUseSupportStatus = jest.fn();

jest.mock( '../../contexts/HelpCenterContext', () => ( {
	useFeatureConfig: () => mockUseFeatureConfig(),
} ) );

jest.mock( '../../data/use-support-status', () => ( {
	useSupportStatus: ( enabled?: boolean ) => mockUseSupportStatus( enabled ),
} ) );

const eligibleCta = {
	id: 'onboarding-call-v1',
	variant: 'banner',
	url: 'https://savvycal.com/CustomerExperience/wordpresscom-onboarding-hc',
};

const setup = ( {
	contextualCta = true,
	isLoading = false,
	cta = eligibleCta,
}: {
	contextualCta?: boolean;
	isLoading?: boolean;
	cta?: SupportStatus[ 'cta' ] | null;
} = {} ) => {
	mockUseFeatureConfig.mockReturnValue( { home: { contextualCta } } );
	mockUseSupportStatus.mockReturnValue( { data: cta ? { cta } : {}, isLoading } );

	return renderHook( () => useHelpCenterCTA( 'help-center-home' ) );
};

describe( 'useHelpCenterCTA', () => {
	afterEach( () => {
		jest.clearAllMocks();
	} );

	it( 'returns renderable props for an eligible user', () => {
		const { result } = setup();

		expect( result.current ).toEqual( {
			variant: 'banner',
			ctaId: 'onboarding-call-v1',
			placement: 'help-center-home',
			url: eligibleCta.url,
			title: 'Book Your Free Onboarding Call',
			description: undefined,
		} );
	} );

	it( 'returns null while support status is loading', () => {
		const { result } = setup( { isLoading: true } );

		expect( result.current ).toBeNull();
	} );

	it( 'returns null when the payload carries no cta', () => {
		const { result } = setup( { cta: null } );

		expect( result.current ).toBeNull();
	} );

	it( 'returns null for a campaign id it has no copy for', () => {
		const { result } = setup( { cta: { ...eligibleCta, id: 'unknown-campaign' } } );

		expect( result.current ).toBeNull();
	} );

	it( 'returns null for an unsupported variant', () => {
		const { result } = setup( { cta: { ...eligibleCta, variant: 'default' } } );

		expect( result.current ).toBeNull();
	} );

	it( 'skips the CTA and the support-status fetch when the product disables it', () => {
		const { result } = setup( { contextualCta: false } );

		expect( result.current ).toBeNull();
		expect( mockUseSupportStatus ).toHaveBeenCalledWith( false );
	} );
} );
