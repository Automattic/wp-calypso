/**
 * @jest-environment jsdom
 */

jest.mock(
	'calypso/signup/step-wrapper',
	() => ( props: { stepContent?: React.ReactNode } ) => props.stepContent ?? null
);
jest.mock( 'calypso/components/domains/wpcom-domain-search', () => ( {
	WPCOMDomainSearch: jest.fn().mockReturnValue( null ),
} ) );
jest.mock( 'calypso/components/domains/wpcom-domain-search/use-query-handler', () => ( {
	useQueryHandler: jest.fn( () => ( { query: '', setQuery: jest.fn(), clearQuery: jest.fn() } ) ),
} ) );

import React from 'react';
import { WPCOMDomainSearch } from 'calypso/components/domains/wpcom-domain-search';
import { useQueryHandler } from 'calypso/components/domains/wpcom-domain-search/use-query-handler';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import DomainSearchStep from '../';

const mockWPCOMDomainSearch = WPCOMDomainSearch as jest.Mock;
const mockUseQueryHandler = useQueryHandler as jest.Mock;

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

describe( 'DomainSearchStep — Gravatar domain prefill', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockWPCOMDomainSearch.mockReturnValue( null );
	} );

	it( 'strips the TLD from the prefilled query so every included TLD stays visible', () => {
		renderWithProvider(
			<DomainSearchStep
				{ ...baseProps }
				flowName="domain-for-gravatar"
				queryObject={ { new: 'example.link' } }
			/>
		);

		expect( mockUseQueryHandler ).toHaveBeenCalledWith(
			expect.objectContaining( { initialQuery: 'example' } )
		);
	} );

	it( 'leaves the prefilled query untouched in other flows', () => {
		renderWithProvider(
			<DomainSearchStep { ...baseProps } queryObject={ { new: 'example.link' } } />
		);

		expect( mockUseQueryHandler ).toHaveBeenCalledWith(
			expect.objectContaining( { initialQuery: 'example.link' } )
		);
	} );
} );
