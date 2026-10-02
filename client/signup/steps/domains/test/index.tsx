/**
 * @jest-environment jsdom
 */

jest.mock( 'calypso/signup/step-wrapper', () =>
	jest.fn( ( props: { stepContent?: React.ReactNode } ) => props.stepContent ?? null )
);
jest.mock( 'calypso/components/domains/wpcom-domain-search', () => ( {
	WPCOMDomainSearch: jest.fn().mockReturnValue( null ),
} ) );
jest.mock( 'calypso/components/domains/wpcom-domain-search/use-query-handler', () => {
	const handler = { query: '', setQuery: jest.fn(), clearQuery: jest.fn(), resetQuery: jest.fn() };
	return { useQueryHandler: jest.fn( () => handler ) };
} );

import config from '@automattic/calypso-config';
import React from 'react';
import { WPCOMDomainSearch } from 'calypso/components/domains/wpcom-domain-search';
import { useQueryHandler } from 'calypso/components/domains/wpcom-domain-search/use-query-handler';
import StepWrapper from 'calypso/signup/step-wrapper';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import DomainSearchStep from '../';

const mockWPCOMDomainSearch = WPCOMDomainSearch as jest.Mock;
const mockUseQueryHandler = useQueryHandler as jest.Mock;
const mockQueryHandler = mockUseQueryHandler() as { clearQuery: jest.Mock; resetQuery: jest.Mock };
const mockStepWrapper = StepWrapper as unknown as jest.Mock;

const domainItem = { meta: 'example.com', product_slug: 'domain_reg' };

const baseProps = {
	flowName: 'domain',
	stepName: 'domain-only',
	stepSectionName: null,
	goToStep: jest.fn(),
	goToNextStep: jest.fn(),
	submitSignupStep: jest.fn(),
	queryObject: {} as Record< string, string | undefined >,
	locale: 'en',
	previousStepName: null,
};

function renderStep( props = baseProps, options = {} ) {
	mockWPCOMDomainSearch.mockClear();
	mockUseQueryHandler.mockClear();
	mockQueryHandler.clearQuery.mockClear();
	mockQueryHandler.resetQuery.mockClear();
	renderWithProvider( <DomainSearchStep { ...props } />, options );
	return mockWPCOMDomainSearch.mock.calls[ 0 ][ 0 ].events;
}

const LOGGED_IN_STATE = { currentUser: { id: 12345 } };

describe( 'DomainSearchStep — domain-only checkout simplification', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockWPCOMDomainSearch.mockReturnValue( null );
	} );

	it( 'auto-submits the skipped steps and routes logged-out users to the account step', () => {
		const submitSignupStep = jest.fn();
		const goToStep = jest.fn();
		const goToNextStep = jest.fn();
		const events = renderStep( { ...baseProps, submitSignupStep, goToStep, goToNextStep } );

		events.onContinue( [ domainItem ] );

		// 4 total: domain-only step + 3 skipped steps
		expect( submitSignupStep ).toHaveBeenCalledTimes( 4 );
		expect( submitSignupStep ).toHaveBeenNthCalledWith(
			1,
			expect.objectContaining( {
				stepName: 'domain-only',
				domainItem,
				isPurchasingItem: true,
				siteUrl: 'example.com',
			} ),
			expect.objectContaining( {
				domainItem,
				siteUrl: 'example.com',
			} )
		);
		expect( submitSignupStep ).toHaveBeenNthCalledWith(
			2,
			expect.objectContaining( { stepName: 'site-or-domain', designType: 'domain' } ),
			expect.objectContaining( { designType: 'domain' } )
		);
		expect( submitSignupStep ).toHaveBeenNthCalledWith(
			3,
			expect.objectContaining( { stepName: 'site-picker', wasSkipped: true } ),
			expect.objectContaining( { themeSlugWithRepo: 'pub/twentysixteen' } )
		);
		expect( submitSignupStep ).toHaveBeenNthCalledWith(
			4,
			expect.objectContaining( { stepName: 'plans-site-selected', wasSkipped: true } ),
			expect.objectContaining( { cartItems: null } )
		);
		// Logged out: jump to the account step instead of the skipped site-or-domain step.
		expect( goToStep ).toHaveBeenCalledTimes( 1 );
		expect( goToStep ).toHaveBeenCalledWith( expect.stringMatching( /^user/ ) );
		expect( goToNextStep ).not.toHaveBeenCalled();
	} );

	it( 'skips straight to checkout for logged-in users in the domain flow', () => {
		const submitSignupStep = jest.fn();
		const goToStep = jest.fn();
		const goToNextStep = jest.fn();
		const events = renderStep(
			{ ...baseProps, submitSignupStep, goToStep, goToNextStep },
			{ initialState: LOGGED_IN_STATE }
		);

		events.onContinue( [ domainItem ] );

		// Same auto-submitted steps, but no account step remains, so proceed to checkout.
		expect( submitSignupStep ).toHaveBeenCalledTimes( 4 );
		expect( goToNextStep ).toHaveBeenCalledTimes( 1 );
		expect( goToStep ).not.toHaveBeenCalled();
	} );

	it( 'submits the domain step and does not skip steps in a non-domain flow', () => {
		const submitSignupStep = jest.fn();
		const goToNextStep = jest.fn();
		const events = renderStep( {
			...baseProps,
			flowName: 'onboarding',
			submitSignupStep,
			goToNextStep,
		} );

		events.onContinue( [ domainItem ] );

		expect( submitSignupStep ).toHaveBeenCalledTimes( 1 );
		expect( submitSignupStep ).toHaveBeenCalledWith(
			expect.objectContaining( {
				stepName: 'domain-only',
				domainItem,
				isPurchasingItem: true,
				siteUrl: 'example.com',
			} ),
			expect.objectContaining( {
				domainItem,
				siteUrl: 'example.com',
			} )
		);
		expect( goToNextStep ).toHaveBeenCalledTimes( 1 );
	} );
} );

describe( 'DomainSearchStep — Name Pulse search', () => {
	let isEnabledSpy: jest.SpyInstance;

	beforeEach( () => {
		mockWPCOMDomainSearch.mockReturnValue( null );
		isEnabledSpy = jest
			.spyOn( config, 'isEnabled' )
			.mockImplementation( ( flag: string ) => flag === 'domain-search/name-pulse' );
	} );

	afterEach( () => {
		isEnabledSpy.mockRestore();
	} );

	const namePulseWiring = ( events: { onQueryClear: () => void } ) => {
		events.onQueryClear();

		return {
			showNamePulseSearch: mockWPCOMDomainSearch.mock.calls[ 0 ][ 0 ].config.showNamePulseSearch,
			persistQuery: mockUseQueryHandler.mock.calls[ 0 ][ 0 ].persistQuery,
			clearedWith: mockQueryHandler.resetQuery.mock.calls.length ? 'resetQuery' : 'clearQuery',
		};
	};

	it( 'enables it for the domain-only flow when the flag is on: no persisted query, clearing resets', () => {
		expect( namePulseWiring( renderStep() ) ).toEqual( {
			showNamePulseSearch: true,
			persistQuery: false,
			clearedWith: 'resetQuery',
		} );
	} );

	it( 'keeps it off for other flows', () => {
		expect( namePulseWiring( renderStep( { ...baseProps, flowName: 'onboarding' } ) ) ).toEqual( {
			showNamePulseSearch: false,
			persistQuery: true,
			clearedWith: 'clearQuery',
		} );
	} );

	it( 'keeps it off when the flag is off', () => {
		isEnabledSpy.mockImplementation( () => false );

		expect( namePulseWiring( renderStep() ) ).toEqual( {
			showNamePulseSearch: false,
			persistQuery: true,
			clearedWith: 'clearQuery',
		} );
	} );

	it( 'seeds the search from ?new= so Name Pulse can restore it after a refresh', () => {
		renderStep( { ...baseProps, queryObject: { new: 'coffeeshop' } } );

		expect( mockUseQueryHandler.mock.calls[ 0 ][ 0 ].initialQuery ).toBe( 'coffeeshop' );
	} );

	it( 'lifts the domain-only exclusion on the free-first-year promo', () => {
		renderStep();

		expect( mockWPCOMDomainSearch.mock.calls[ 0 ][ 0 ].slots.BeforeResults() ).not.toBeNull();
	} );

	it( 'keeps the promo hidden on the classic domain-only results page', () => {
		isEnabledSpy.mockImplementation( () => false );

		renderStep();

		expect( mockWPCOMDomainSearch.mock.calls[ 0 ][ 0 ].slots.BeforeResults() ).toBeNull();
	} );
} );

describe( 'DomainSearchStep — launch-site Back button', () => {
	const launchProps = {
		...baseProps,
		flowName: 'launch-site',
		stepName: 'domains-launch',
	};

	// The site the signup controller loaded and selected for the flow.
	const withSelectedSite = ( selectedSiteId: number | null ) => ( {
		initialState: {
			currentUser: { id: 12345 },
			sites: { items: { 77: { ID: 77, URL: 'https://real-site.wordpress.com' } } },
		},
		reducers: { ui: () => ( { selectedSiteId } ) },
	} );

	const renderWithBackTo = ( backTo: string, selectedSiteId: number | null = 77 ) => {
		window.history.replaceState(
			{},
			'',
			`/start/launch-site/domains-launch?back_to=${ encodeURIComponent( backTo ) }`
		);
		mockStepWrapper.mockClear();
		renderWithProvider(
			<DomainSearchStep { ...launchProps } />,
			withSelectedSite( selectedSiteId )
		);
		return mockStepWrapper.mock.calls.at( -1 )?.[ 0 ];
	};

	beforeEach( () => {
		jest.clearAllMocks();
		mockWPCOMDomainSearch.mockReturnValue( null );
	} );

	afterAll( () => {
		window.history.replaceState( {}, '', '/' );
	} );

	it( 'returns to a wp-admin screen on the site the flow loaded', () => {
		const backTo = 'https://real-site.wordpress.com/wp-admin/post.php?post=1&action=edit';
		const props = renderWithBackTo( backTo );

		expect( props?.backUrl ).toBe( backTo );
		expect( props?.backLabelText ).toBe( 'Back' );
	} );

	it( 'ignores a back_to on any other host', () => {
		const props = renderWithBackTo( 'https://evil.example/wp-admin/tools.php' );

		expect( props?.backUrl ).not.toContain( 'evil.example' );
		expect( props?.backLabelText ).toBe( 'Back to sites' );
	} );

	it( 'ignores a site-host back_to when no site was loaded for the flow', () => {
		const props = renderWithBackTo( 'https://real-site.wordpress.com/wp-admin/tools.php', null );

		expect( props?.backLabelText ).toBe( 'Back to sites' );
	} );
} );
