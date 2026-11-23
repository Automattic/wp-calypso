/** @jest-environment jsdom */
// @ts-nocheck - TODO: Fix TypeScript issues
jest.mock( 'calypso/signup/step-wrapper', () => () => null );
jest.mock(
	'@automattic/onboarding/src/step-container-v2/wireframes/WideLayout/WideLayout',
	() => ( { WideLayout: ( { topBar } ) => <div>{ topBar }</div> } )
);
jest.mock( '@automattic/onboarding/src/step-container-v2/components/TopBar/TopBar', () => ( {
	TopBar: ( { rightElement } ) => <div>{ rightElement }</div>,
} ) );
jest.mock( 'calypso/components/marketing-message', () => 'marketing-message' );
jest.mock( 'calypso/lib/wp', () => ( { req: { post: () => {} } } ) );
jest.mock( '../../../../flows/onboarding/use-onboarding-step-counter', () => ( {
	useOnboardingStepCounter: jest.fn(),
} ) );

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { useOnboardingStepCounter } from '../../../../flows/onboarding/use-onboarding-step-counter';
import { renderStep } from '../../test/helpers';
import UnifiedPlansStep from '../unified-plans-step';

const noop = () => {};

const render = ( flowName: string, extraProps = {} ) =>
	renderStep(
		<UnifiedPlansStep
			flowName={ flowName }
			stepName="plans"
			signupDependencies={ { domainItem: null } }
			saveSignupStep={ noop }
			submitSignupStep={ noop }
			goToNextStep={ noop }
			onPlanIntervalUpdate={ noop }
			useStepperWrapper
			useStepContainerV2
			wrapperProps={ {
				hideBack: false,
				goBack: noop,
				isFullLayout: true,
				isExtraWideLayout: true,
			} }
			{ ...extraProps }
		/>
	);

describe( 'Plans step counter', () => {
	beforeEach( () => jest.clearAllMocks() );

	it( 'shows the counter outside onboarding when the hook returns one', async () => {
		useOnboardingStepCounter.mockReturnValue( { current: 2, total: 3 } );
		render( 'new-hosted-site' );

		await waitFor( () => expect( screen.getByText( '2 of 3' ) ).toBeInTheDocument() );
		expect( screen.queryByText( 'Need help?' ) ).not.toBeInTheDocument();
	} );

	it( 'keeps the help link for onboarding without a counter', async () => {
		useOnboardingStepCounter.mockReturnValue( null );
		render( 'onboarding' );

		await waitFor( () => expect( screen.getByText( 'Need help?' ) ).toBeInTheDocument() );
		expect( document.querySelector( '.step-container-v2__step-counter' ) ).toBeNull();
	} );
} );

describe( 'Plans step skip', () => {
	beforeEach( () => useOnboardingStepCounter.mockReturnValue( null ) );

	it( 'offers a Skip button that calls onSkip', async () => {
		const onSkip = jest.fn();
		render( 'launch-site', { onSkip } );

		await userEvent.click( await screen.findByText( 'Skip' ) );

		expect( onSkip ).toHaveBeenCalled();
	} );

	it( 'offers no Skip button without onSkip', async () => {
		render( 'launch-site' );

		await waitFor( () => expect( screen.queryByText( 'Skip' ) ).not.toBeInTheDocument() );
	} );
} );
