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
	useQueryHandler: () => ( { query: '', setQuery: jest.fn(), clearQuery: jest.fn() } ),
} ) );

import React from 'react';
import { WPCOMDomainSearch } from 'calypso/components/domains/wpcom-domain-search';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import DomainSearchStep from '../';

const mockWPCOMDomainSearch = WPCOMDomainSearch as jest.Mock;

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

function renderStep( props = baseProps ) {
	mockWPCOMDomainSearch.mockClear();
	renderWithProvider( <DomainSearchStep { ...props } /> );
	return mockWPCOMDomainSearch.mock.calls[ 0 ][ 0 ].events;
}

describe( 'DomainSearchStep — domain-only checkout simplification', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockWPCOMDomainSearch.mockReturnValue( null );
	} );

	it( 'auto-submits site-or-domain, site-picker, and plans-site-selected in the domain flow', () => {
		const submitSignupStep = jest.fn();
		const goToNextStep = jest.fn();
		const events = renderStep( { ...baseProps, submitSignupStep, goToNextStep } );

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
		expect( goToNextStep ).toHaveBeenCalledTimes( 1 );
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
