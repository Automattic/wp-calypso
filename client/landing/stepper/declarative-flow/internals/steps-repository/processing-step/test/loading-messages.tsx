/**
 * @jest-environment jsdom
 */
import { ONBOARDING_FLOW } from '@automattic/onboarding';
import { act, screen } from '@testing-library/react';
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
jest.mock( '../hooks/use-processing-loading-messages', () => ( {
	useProcessingLoadingMessages: () => [
		{ title: 'Default first step', duration: 2000 },
		{ title: 'Default second step', duration: 3000 },
	],
} ) );

type ProcessingStepProps = React.ComponentProps< typeof ProcessingStep >;

const TITLE_DELAY_MS = 1000;

describe( 'ProcessingStep loading-carousel accepts-props', () => {
	// The onboard store is shared across tests in this file; a completed run would
	// otherwise leave the next render with nothing to show.
	beforeEach( () => {
		jest.useFakeTimers();
		( dispatch( ONBOARD_STORE ) as OnboardActions ).resetOnboardStore();
	} );

	afterEach( () => {
		jest.useRealTimers();
	} );

	const render = ( props = {} ) => {
		const rendered = renderStep(
			<ProcessingStep
				{ ...( mockStepProps( { flow: ONBOARDING_FLOW, ...props } ) as ProcessingStepProps ) }
			/>
		);

		act( () => void jest.advanceTimersByTime( TITLE_DELAY_MS ) );

		return rendered;
	};

	it( 'renders the default per-flow carousel when no loadingMessages prop is passed', () => {
		render();

		expect( screen.getByText( 'Default first step' ) ).toBeVisible();
	} );

	it( 'renders the flow-provided loadingMessages override instead of the default', () => {
		render( {
			loadingMessages: [
				{ title: 'Custom first step', duration: 2000 },
				{ title: 'Custom second step' },
			],
		} );

		expect( screen.getByText( 'Custom first step' ) ).toBeVisible();
		expect( screen.queryByText( 'Default first step' ) ).not.toBeInTheDocument();
	} );
} );
