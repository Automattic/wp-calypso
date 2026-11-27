/** @vitest-environment jsdom */
// @ts-nocheck - TODO: Fix TypeScript issues
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { vi } from 'vitest';
import { useOnboardingStepCounter } from '../../../../flows/onboarding/use-onboarding-step-counter';
import { renderStep } from '../../test/helpers';
import UnifiedPlansStep from '../unified-plans-step';

vi.mock( 'calypso/signup/step-wrapper', () => ( { default: () => null } ) );
vi.mock( '@automattic/onboarding/src/step-container-v2/wireframes/WideLayout/WideLayout', () => ( {
	WideLayout: ( { topBar } ) => <div>{ topBar }</div>,
} ) );
vi.mock( '@automattic/onboarding/src/step-container-v2/components/TopBar/TopBar', () => ( {
	TopBar: ( { rightElement } ) => <div>{ rightElement }</div>,
} ) );
vi.mock( 'calypso/components/marketing-message', () => ( { default: 'marketing-message' } ) );
vi.mock( 'calypso/lib/wp', () =>
	( ( m ) => ( { ...m, default: m } ) )( { req: { post: () => {} } } )
);
vi.mock( '../../../../flows/onboarding/use-onboarding-step-counter', () => ( {
	useOnboardingStepCounter: vi.fn(),
} ) );

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
	beforeEach( () => vi.clearAllMocks() );

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
		const onSkip = vi.fn();
		render( 'launch-site', { onSkip } );

		await userEvent.click( await screen.findByText( 'Skip' ) );

		expect( onSkip ).toHaveBeenCalled();
	} );

	it( 'offers no Skip button without onSkip', async () => {
		render( 'launch-site' );

		await waitFor( () => expect( screen.queryByText( 'Skip' ) ).not.toBeInTheDocument() );
	} );
} );
