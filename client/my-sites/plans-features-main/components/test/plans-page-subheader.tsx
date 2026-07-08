/** @jest-environment jsdom */

import { fireEvent, screen } from '@testing-library/react';
import React from 'react';
import { shouldUseStepContainerV2 } from 'calypso/landing/stepper/declarative-flow/helpers/should-use-step-container-v2';
import PlansPageSubheader from 'calypso/my-sites/plans-features-main/components/plans-page-subheader';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';

jest.mock(
	'calypso/landing/stepper/declarative-flow/helpers/should-use-step-container-v2',
	() => ( {
		shouldUseStepContainerV2: jest.fn(),
	} )
);

const defaultProps = {
	isDisplayingPlansNeededForFeature: false,
	deemphasizeFreePlan: true,
	offeringFreePlan: true,
	flowName: 'domain',
	onFreePlanCTAClick: jest.fn(),
	selectedFeature: null,
};

describe( 'PlansPageSubheader', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		jest.mocked( shouldUseStepContainerV2 ).mockReturnValue( true );
	} );

	test( 'does not render the free-plan CTA in stepper-v2 by default', () => {
		renderWithProvider( <PlansPageSubheader { ...defaultProps } /> );

		expect(
			screen.queryByRole( 'button', { name: 'start with a free plan' } )
		).not.toBeInTheDocument();
	} );

	test( 'renders a modal-backed free-plan CTA in stepper-v2 when requested', () => {
		renderWithProvider(
			<PlansPageSubheader { ...defaultProps } renderFreePlanCtaInStepContainerV2 />
		);

		fireEvent.click( screen.getByRole( 'button', { name: 'start with a free plan' } ) );

		expect( defaultProps.onFreePlanCTAClick ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'renders pricing differentiators when requested', () => {
		renderWithProvider(
			<PlansPageSubheader
				{ ...defaultProps }
				flowName="onboarding"
				showDifferentiatorHeader
				renderFreePlanCtaInStepContainerV2
			/>
		);

		expect( screen.getByText( /Unlock a powerful bundle of features/ ) ).toBeInTheDocument();
		expect( screen.getByRole( 'button', { name: 'start with a free plan' } ) ).toBeInTheDocument();
		expect(
			screen.queryByText(
				'Whatever site you’re building, there’s a plan to make it happen sooner.'
			)
		).not.toBeInTheDocument();
		expect( screen.getByText( 'Paid plans include:' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Unlimited traffic' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Managed hosting' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Built-in security' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Fast site loading' ) ).toBeInTheDocument();
	} );

	test( 'does not render the free-plan CTA copy with differentiators unless the free-plan CTA subheader is eligible', () => {
		renderWithProvider( <PlansPageSubheader { ...defaultProps } showDifferentiatorHeader /> );

		expect( screen.queryByText( /Unlock a powerful bundle of features/ ) ).not.toBeInTheDocument();
		expect( screen.getByText( 'Paid plans include:' ) ).toBeInTheDocument();
	} );
} );
