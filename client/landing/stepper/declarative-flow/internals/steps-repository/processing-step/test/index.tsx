/**
 * @jest-environment jsdom
 */
import { TRANSFERRING_HOSTED_SITE_FLOW, ONBOARDING_FLOW } from '@automattic/onboarding';
import { act, screen } from '@testing-library/react';
import { dispatch } from '@wordpress/data';
import React from 'react';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { transferStates } from 'calypso/state/automated-transfer/constants';
import ProcessingStep from '../';
import { recordStepComponentType, recordStepRouteMount } from '../../../step-mount-registry';
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

type ProcessingStepProps = React.ComponentProps< typeof ProcessingStep >;

describe( 'ProcessingStep', () => {
	const onboardActions = () => dispatch( ONBOARD_STORE ) as OnboardActions;
	const render = ( props: Partial< ProcessingStepProps > ) =>
		renderStep( <ProcessingStep { ...( mockStepProps( props ) as ProcessingStepProps ) } /> );

	beforeEach( () => {
		jest.clearAllMocks();
		onboardActions().setTransferStatus( null );
		onboardActions().setTransferStartedAt( null );
	} );

	it( 'shows the transfer wait for a transferring hosted site creation flow', () => {
		onboardActions().setTransferStatus( transferStates.ACTIVE );

		render( { flow: TRANSFERRING_HOSTED_SITE_FLOW } );

		expect( screen.getByText( 'Setting up your site' ) ).toBeVisible();
		expect( screen.getByRole( 'status' ).textContent ).toContain( 'preparing a dedicated server' );
		expect( screen.getByRole( 'progressbar' ) ).toHaveAttribute(
			'aria-label',
			'Preparing a dedicated server'
		);
	} );

	it( 'narrates the stage the transfer is actually in', () => {
		onboardActions().setTransferStatus( transferStates.RELOCATING );

		render( { flow: TRANSFERRING_HOSTED_SITE_FLOW } );

		expect( screen.getByRole( 'status' ).textContent ).toContain(
			'moving your site to the new server'
		);
	} );

	it( 'offers a way to the site once the transfer wait stalls', () => {
		jest.useFakeTimers();
		onboardActions().setTransferStatus( transferStates.COMPLETE );

		render( { flow: TRANSFERRING_HOSTED_SITE_FLOW } );
		act( () => jest.advanceTimersByTime( 95_000 ) );

		expect( screen.getByRole( 'link', { name: 'Go to your site' } ) ).toHaveAttribute(
			'href',
			'/sites/example.wordpress.com'
		);
		jest.useRealTimers();
	} );

	// The processing step is seen mounting twice for one signup in production, a second or less
	// apart, and only for translated locales. The wait heartbeat is the only event that fires once
	// per mount, so it carries how this mount came about: which component type the renderer handed
	// React for the step, and how long after the route mounted the step itself did.
	it( 'reports how the step came to mount on the wait heartbeat', () => {
		const now = jest.spyOn( performance, 'now' );
		now.mockReturnValue( 5000 );
		recordStepRouteMount( 'processing' );
		recordStepComponentType( 'processing', 'lazy' );
		now.mockReturnValue( 5040 );
		onboardActions().setPendingAction( () => new Promise( () => {} ) );

		render( { flow: ONBOARDING_FLOW, stepName: 'processing' } );

		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_transfer_wait_started',
			expect.objectContaining( {
				surface: 'stepper_processing',
				step_component_type: 'lazy',
				ms_since_route_mount: 40,
			} )
		);
		now.mockRestore();
	} );

	it( 'keeps the generic loading screen for other flows', () => {
		render( { flow: ONBOARDING_FLOW, title: 'Building your site' } );

		expect( screen.queryByText( 'Setting up your site' ) ).not.toBeInTheDocument();
	} );
} );
