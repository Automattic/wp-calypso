/**
 * @jest-environment jsdom
 */
import { ONBOARDING_FLOW } from '@automattic/onboarding';
import { screen } from '@testing-library/react';
import { dispatch } from '@wordpress/data';
import React from 'react';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import ProcessingStep from '../';
import { mockStepProps, renderStep } from '../../test/helpers/index';
import type { OnboardActions } from '@automattic/data-stores';

jest.mock( 'calypso/landing/stepper/hooks/use-record-signup-complete', () => ( {
	useRecordSignupComplete: () => jest.fn(),
} ) );
jest.mock( 'calypso/lib/analytics/signup', () => ( {
	recordSignupProcessingScreen: jest.fn(),
} ) );
jest.mock( 'calypso/lib/analytics/tracks', () => ( {
	recordTracksEvent: jest.fn(),
} ) );
jest.mock( 'calypso/landing/stepper/hooks/use-site-data', () => ( {
	useSiteData: () => ( { siteSlug: 'example.wordpress.com' } ),
} ) );
// Freeze the carousel on its first message: these tests assert which list is
// selected, not the rotation (covered by the use-loading-message-index suite).
jest.mock( 'calypso/lib/interval', () => ( { useInterval: () => undefined } ) );
jest.mock( '../hooks/use-processing-loading-messages', () => ( {
	useProcessingLoadingMessages: () => [
		{ title: 'Default first step', duration: 2000 },
		{ title: 'Default second step', duration: 3000 },
	],
} ) );

type ProcessingStepProps = React.ComponentProps< typeof ProcessingStep >;

describe( 'ProcessingStep loading-carousel accepts-props', () => {
	// The onboard store is shared across tests in this file; a completed run would
	// otherwise leave the next render with nothing to show.
	beforeEach( () => {
		( dispatch( ONBOARD_STORE ) as OnboardActions ).resetOnboardStore();
	} );

	const render = ( props = {} ) =>
		renderStep(
			<ProcessingStep
				{ ...( mockStepProps( { flow: ONBOARDING_FLOW, ...props } ) as ProcessingStepProps ) }
			/>
		);

	it( 'renders the default per-flow carousel when no loadingMessages prop is passed', async () => {
		render();

		expect( await screen.findByText( 'Default first step' ) ).toBeVisible();
	} );

	it( 'renders the flow-provided loadingMessages override instead of the default', async () => {
		render( {
			loadingMessages: [
				{ title: 'Custom first step', duration: 1000 },
				{ title: 'Custom second step' },
			],
		} );

		expect( await screen.findByText( 'Custom first step' ) ).toBeVisible();
		expect( screen.queryByText( 'Default first step' ) ).not.toBeInTheDocument();
	} );
} );
