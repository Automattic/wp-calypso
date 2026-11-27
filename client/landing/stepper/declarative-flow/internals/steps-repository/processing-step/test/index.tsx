/**
 * @vitest-environment jsdom
 */
import { TRANSFERRING_HOSTED_SITE_FLOW, ONBOARDING_FLOW } from '@automattic/onboarding';
import { CartActionConnectionError, CartActionResponseError } from '@automattic/shopping-cart';
import { act, screen, waitFor } from '@testing-library/react';
import { dispatch, select } from '@wordpress/data';
import React from 'react';
import { vi } from 'vitest';
import { ONBOARD_STORE, SITE_STORE } from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { logToLogstash } from 'calypso/lib/logstash';
import { transferStates } from 'calypso/state/automated-transfer/constants';
import ProcessingStep from '../';
import { recordStepComponentType, recordStepRouteMount } from '../../../step-mount-registry';
import { mockStepProps, renderStep } from '../../test/helpers/index';
import { ProcessingResult } from '../constants';
import type { OnboardActions } from '@automattic/data-stores';

const mockRecordSignupComplete = vi.fn();
const mockCaptureFlowException = vi.fn();

vi.mock( 'calypso/landing/stepper/hooks/use-record-signup-complete', () => ( {
	useRecordSignupComplete: () => mockRecordSignupComplete,
} ) );
vi.mock( 'calypso/landing/stepper/hooks/use-capture-flow-exception', () => ( {
	__esModule: true,
	default: () => mockCaptureFlowException,
} ) );
vi.mock( 'calypso/landing/stepper/declarative-flow/registered-flows', () =>
	( ( m ) => ( { ...m, default: m } ) )( {
		onboarding: async () => ( { default: { isSignupFlow: true } } ),
	} )
);
vi.mock( 'calypso/lib/analytics/signup', () => ( {
	recordSignupProcessingScreen: vi.fn(),
} ) );
vi.mock( 'calypso/lib/analytics/tracks', () => ( {
	recordTracksEvent: vi.fn(),
} ) );
vi.mock( 'calypso/lib/logstash', () => ( {
	logToLogstash: vi.fn( () => Promise.resolve() ),
} ) );
vi.mock( 'calypso/landing/stepper/hooks/use-site-data', () => ( {
	useSiteData: () => ( { siteSlug: 'example.wordpress.com' } ),
} ) );

type ProcessingStepProps = React.ComponentProps< typeof ProcessingStep >;

describe( 'ProcessingStep', () => {
	const onboardActions = () => dispatch( ONBOARD_STORE ) as OnboardActions;
	const render = ( props: Partial< ProcessingStepProps > ) =>
		renderStep( <ProcessingStep { ...( mockStepProps( props ) as ProcessingStepProps ) } /> );

	beforeEach( () => {
		vi.clearAllMocks();
		onboardActions().setTransferStatus( null );
		onboardActions().setTransferStartedAt( null );
		onboardActions().setTransferTimedOut( false );
		onboardActions().setPendingAction( undefined );
	} );

	describe( 'signup completion', () => {
		const runPendingAction = async ( props: Partial< ProcessingStepProps > ) => {
			onboardActions().setPendingAction( async () => ( { siteSlug: 'example.wordpress.com' } ) );
			const stepProps = mockStepProps( { flow: ONBOARDING_FLOW, ...props } ) as ProcessingStepProps;
			renderStep( <ProcessingStep { ...stepProps } /> );
			await waitFor( () => expect( stepProps.navigation.submit ).toHaveBeenCalled() );
			// The flow is looked up asynchronously before the completion is recorded.
			await act( async () => {} );
		};

		it( 'records the completion of a signup flow', async () => {
			await runPendingAction( {} );

			expect( mockRecordSignupComplete ).toHaveBeenCalledWith(
				expect.objectContaining( { siteSlug: 'example.wordpress.com' } )
			);
		} );

		it( 'leaves the completion to a run that already recorded it', async () => {
			await runPendingAction( { skipSignupComplete: true } );

			expect( mockRecordSignupComplete ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'a failed pending action', () => {
		const runFailingAction = async ( error: Error ) => {
			onboardActions().setPendingAction( async () => {
				throw error;
			} );
			const stepProps = mockStepProps( { flow: ONBOARDING_FLOW } ) as ProcessingStepProps;
			renderStep( <ProcessingStep { ...stepProps } /> );
			await waitFor( () => expect( stepProps.navigation.submit ).toHaveBeenCalled() );
			return stepProps;
		};

		// The WordPress.com cart validator returns this code when the chosen domain is taken.
		const unavailableDomainRejection = () =>
			new CartActionResponseError(
				'Sorry, the domain you are trying to add is no longer available.',
				'domain-not-available'
			);

		it.each( [ 'domain-not-available', 'domain-restricted', 'not_allowed_to_register' ] )(
			'does not report a cart rejection with the expected code %s to Sentry',
			async ( code ) => {
				await runFailingAction(
					new CartActionResponseError( 'The domain is not available.', code )
				);

				expect( mockCaptureFlowException ).not.toHaveBeenCalled();
			}
		);

		// An unknown code can mean Calypso sent a bad cart item, which only Sentry makes visible.
		it( 'reports a cart rejection with an unexpected code to Sentry', async () => {
			const error = new CartActionResponseError(
				'Sorry, there is a problem adding your product to cart.',
				'invalid-product-not-valid-domain'
			);
			await runFailingAction( error );

			expect( mockCaptureFlowException ).toHaveBeenCalledWith( error );
		} );

		// Some flows do not go to the error step, so this line is their only record of the rejection.
		it( 'logs a cart rejection to Logstash with its code', async () => {
			await runFailingAction( unavailableDomainRejection() );

			expect( logToLogstash ).toHaveBeenCalledWith(
				expect.objectContaining( {
					message: 'Cart rejection in Stepper processing step',
					properties: { flow: ONBOARDING_FLOW, error: 'domain-not-available' },
				} )
			);
		} );

		it( 'stores the code and the message of a cart rejection for the error step', async () => {
			await runFailingAction( unavailableDomainRejection() );

			expect( select( SITE_STORE ).getSiteSetupError() ).toEqual( {
				error: 'domain-not-available',
				message: 'Sorry, the domain you are trying to add is no longer available.',
			} );
		} );

		it.each( [
			{
				name: 'a failed cart request',
				error: new CartActionConnectionError( 'Failed to fetch', 'SET_SERVER_CART_ERROR' ),
			},
			{ name: 'any other error', error: new Error( 'Site creation failed.' ) },
		] )( 'reports $name to Sentry and does not log it to Logstash', async ( { error } ) => {
			await runFailingAction( error );

			expect( mockCaptureFlowException ).toHaveBeenCalledWith( error );
			expect( logToLogstash ).not.toHaveBeenCalled();
		} );

		// Some flows leave the page as soon as the step submits, so the step waits for the log
		// request, but only up to a time limit.
		it( 'submits the failure when the log request of a cart rejection does not settle', async () => {
			vi.useFakeTimers();
			vi.mocked( logToLogstash ).mockReturnValueOnce( new Promise( () => {} ) );
			onboardActions().setPendingAction( async () => {
				throw unavailableDomainRejection();
			} );
			const stepProps = mockStepProps( { flow: ONBOARDING_FLOW } ) as ProcessingStepProps;
			renderStep( <ProcessingStep { ...stepProps } /> );

			await act( async () => {
				await vi.advanceTimersByTimeAsync( 999 );
			} );
			expect( stepProps.navigation.submit ).not.toHaveBeenCalled();

			await act( async () => {
				await vi.advanceTimersByTimeAsync( 1 );
			} );
			expect( stepProps.navigation.submit ).toHaveBeenCalledWith( {
				processingResult: ProcessingResult.FAILURE,
			} );
			vi.useRealTimers();
		} );
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
		vi.useFakeTimers();
		onboardActions().setTransferStatus( transferStates.COMPLETE );

		render( { flow: TRANSFERRING_HOSTED_SITE_FLOW } );
		act( () => vi.advanceTimersByTime( 95_000 ) );

		expect( screen.getByRole( 'link', { name: 'Go to your site' } ) ).toHaveAttribute(
			'href',
			'/sites/example.wordpress.com'
		);
		vi.useRealTimers();
	} );

	it( 'passes a timed-out wait through to the transfer card', () => {
		onboardActions().setTransferStatus( transferStates.ACTIVE );
		onboardActions().setTransferTimedOut( true );

		render( { flow: TRANSFERRING_HOSTED_SITE_FLOW } );

		expect( screen.getByText( /Your site is still being set up/ ) ).toBeVisible();
		expect( screen.getByRole( 'link', { name: 'Go to your site' } ) ).toHaveAttribute(
			'href',
			'/sites/example.wordpress.com'
		);
	} );

	// The processing step is seen mounting twice for one signup in production, a second or less
	// apart, and only for translated locales. The wait heartbeat is the only event that fires once
	// per mount, so it carries how this mount came about: which component type the renderer handed
	// React for the step, and how long after the route mounted the step itself did.
	it( 'reports how the step came to mount on the wait heartbeat', () => {
		const now = vi.spyOn( performance, 'now' );
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
