/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { NavigationType, useNavigationType } from 'react-router';
import { useSiteDomains } from 'calypso/landing/stepper/hooks/use-site-domains';
import { useSiteSetupError } from 'calypso/landing/stepper/hooks/use-site-setup-error';
import { bumpStat } from 'calypso/lib/analytics/mc';
import { logToLogstash } from 'calypso/lib/logstash';
import ErrorStep from '../';
import { isOnlyStepMounted } from '../../../step-mount-registry';
import { StepProps } from '../../../types';
import { mockStepProps, renderStep, RenderStepOptions } from '../../test/helpers/index';

jest.mock( 'calypso/landing/stepper/hooks/use-site-domains' );
jest.mock( 'calypso/landing/stepper/hooks/use-site-setup-error' );
jest.mock( 'calypso/lib/analytics/mc', () => ( {
	bumpStat: jest.fn(),
} ) );
jest.mock( 'calypso/lib/logstash' );
jest.mock( '../../../step-mount-registry', () => ( {
	isOnlyStepMounted: jest.fn(),
} ) );
jest.mock( 'react-router', () => ( {
	...jest.requireActual( 'react-router' ),
	useNavigationType: jest.fn(),
} ) );

describe( 'ErrorStep', () => {
	const render = ( props?: Partial< StepProps >, renderOptions?: RenderStepOptions ) => {
		// `mockStepProps` writes into shared defaults, so every render sets its own `data`.
		const combinedProps = {
			...mockStepProps( {
				flow: 'onboarding',
				showRetry: false,
				data: { previousStep: 'processing' },
				...props,
			} ),
		};
		return renderStep( <ErrorStep { ...combinedProps } />, {
			initialState: { currentUser: { user: { localeSlug: 'en' } } },
			...renderOptions,
		} );
	};

	beforeEach( () => {
		jest.clearAllMocks();
		( useSiteDomains as jest.Mock ).mockReturnValue( null );
		( isOnlyStepMounted as jest.Mock ).mockReturnValue( false );
		// `MemoryRouter` starts on a POP, but a flow reaches the error step with a push.
		( useNavigationType as jest.Mock ).mockReturnValue( NavigationType.Push );
		( useSiteSetupError as jest.Mock ).mockReturnValue( {
			error: 'site_setup_failed',
			message: 'Something went wrong',
		} );
	} );

	it( 'retries only after the user clicks the enabled recovery action', async () => {
		const submit = jest.fn();
		render( { showRetry: true, navigation: { submit } } );
		expect( submit ).not.toHaveBeenCalled();
		await userEvent.click( screen.getByRole( 'button', { name: 'Try again' } ) );
		expect( submit ).toHaveBeenCalledWith( { action: 'retry' } );
	} );

	it( 'bumps the non-English bin of the MC stat for a non-English account locale', () => {
		render( undefined, { initialState: { currentUser: { user: { localeSlug: 'fr' } } } } );

		expect( bumpStat ).toHaveBeenCalledTimes( 1 );
		expect( bumpStat ).toHaveBeenCalledWith( 'calypso_stepper_error_step', 'onboarding_non_en' );
	} );

	it( 'bumps the English bin when there is no account locale', () => {
		render( undefined, { initialState: { currentUser: { user: null } } } );

		expect( bumpStat ).toHaveBeenCalledTimes( 1 );
		expect( bumpStat ).toHaveBeenCalledWith( 'calypso_stepper_error_step', 'onboarding_en' );
	} );

	it( 'bumps the English bin and indexes the flow, the locale and the error', () => {
		render();
		expect( screen.queryByRole( 'button', { name: 'Try again' } ) ).not.toBeInTheDocument();

		expect( bumpStat ).toHaveBeenCalledTimes( 1 );
		expect( bumpStat ).toHaveBeenCalledWith( 'calypso_stepper_error_step', 'onboarding_en' );

		expect( logToLogstash ).toHaveBeenCalledTimes( 1 );
		expect( logToLogstash ).toHaveBeenCalledWith( {
			feature: 'calypso_client',
			message: 'Error in Stepper flow',
			extra: {
				error: 'site_setup_failed',
				message: 'Something went wrong',
				flow: 'onboarding',
				variant: undefined,
				previous_step: 'processing',
				error_reason: undefined,
				is_flow_arrival: true,
			},
			properties: {
				flow: 'onboarding',
				locale: 'en',
				error: 'site_setup_failed',
			},
		} );
	} );

	it( 'bumps the MC stat and logs a sentinel error code when there is no site setup error', () => {
		( useSiteSetupError as jest.Mock ).mockReturnValue( { error: undefined, message: undefined } );

		render();

		expect( bumpStat ).toHaveBeenCalledTimes( 1 );
		expect( bumpStat ).toHaveBeenCalledWith( 'calypso_stepper_error_step', 'onboarding_en' );

		expect( logToLogstash ).toHaveBeenCalledTimes( 1 );
		expect( logToLogstash ).toHaveBeenCalledWith( {
			feature: 'calypso_client',
			message: 'Error in Stepper flow',
			extra: {
				error: undefined,
				message: undefined,
				flow: 'onboarding',
				variant: undefined,
				previous_step: 'processing',
				error_reason: undefined,
				is_flow_arrival: true,
			},
			properties: {
				flow: 'onboarding',
				locale: 'en',
				error: 'no_stored_error',
			},
		} );
	} );

	const loggedError = () => ( logToLogstash as jest.Mock ).mock.calls[ 0 ][ 0 ].properties.error;
	const loggedExtra = () => ( logToLogstash as jest.Mock ).mock.calls[ 0 ][ 0 ].extra;

	it( 'logs the errorReason from the step data when nothing is stored', () => {
		( useSiteSetupError as jest.Mock ).mockReturnValue( { error: undefined, message: undefined } );

		render( { data: { previousStep: 'processing', errorReason: 'processing_failed' } } );

		expect( loggedError() ).toBe( 'processing_failed' );
	} );

	it( 'logs a stored error code over the errorReason', () => {
		render( { data: { previousStep: 'processing', errorReason: 'processing_failed' } } );

		expect( loggedError() ).toBe( 'site_setup_failed' );
	} );

	it( 'logs stored_message_without_code when a message is stored without a code', () => {
		( useSiteSetupError as jest.Mock ).mockReturnValue( {
			error: undefined,
			message: 'Request failed',
		} );

		render( { data: { previousStep: 'processing', errorReason: 'processing_failed' } } );

		expect( loggedError() ).toBe( 'stored_message_without_code' );
	} );

	it( 'logs history_back_forward over a persisted errorReason for an in-document history arrival', () => {
		( useSiteSetupError as jest.Mock ).mockReturnValue( { error: undefined, message: undefined } );
		( useNavigationType as jest.Mock ).mockReturnValue( NavigationType.Pop );

		render( {
			data: { previousStep: 'setup-your-site-ai', errorReason: 'build_wow_start_failed' },
		} );

		expect( loggedError() ).toBe( 'history_back_forward' );
		expect( loggedExtra() ).toMatchObject( {
			previous_step: 'setup-your-site-ai',
			error_reason: 'build_wow_start_failed',
			is_flow_arrival: false,
		} );
	} );

	it( 'logs the errorReason for a flow arrival that replaces the history entry', () => {
		( useSiteSetupError as jest.Mock ).mockReturnValue( { error: undefined, message: undefined } );
		( useNavigationType as jest.Mock ).mockReturnValue( NavigationType.Replace );

		render( { data: { previousStep: 'processing', errorReason: 'processing_no_redirect' } } );

		expect( loggedError() ).toBe( 'processing_no_redirect' );
		expect( loggedExtra() ).toMatchObject( {
			previous_step: 'processing',
			error_reason: 'processing_no_redirect',
			is_flow_arrival: true,
		} );
	} );

	describe( 'when the error step is the only route mounted in the document', () => {
		const originalGetEntriesByType = performance.getEntriesByType;

		const setNavigationType = ( type?: string ) => {
			performance.getEntriesByType = jest.fn( () => ( type ? [ { type } ] : [] ) ) as never;
		};

		beforeEach( () => {
			( useSiteSetupError as jest.Mock ).mockReturnValue( {
				error: undefined,
				message: undefined,
			} );
			( isOnlyStepMounted as jest.Mock ).mockImplementation( ( slug ) => slug === 'error' );
			// The first location of a document is a POP.
			( useNavigationType as jest.Mock ).mockReturnValue( NavigationType.Pop );
		} );

		afterEach( () => {
			performance.getEntriesByType = originalGetEntriesByType;
		} );

		it( 'logs a stored error code over a document arrival', () => {
			( useSiteSetupError as jest.Mock ).mockReturnValue( { error: 'site_setup_failed' } );
			setNavigationType( 'reload' );

			render();

			expect( loggedError() ).toBe( 'site_setup_failed' );
		} );

		it( 'logs document_reload over a persisted errorReason', () => {
			setNavigationType( 'reload' );

			render( { data: { previousStep: 'processing', errorReason: 'processing_failed' } } );

			expect( loggedError() ).toBe( 'document_reload' );
			expect( loggedExtra() ).toMatchObject( {
				previous_step: 'processing',
				error_reason: 'processing_failed',
				is_flow_arrival: false,
			} );
		} );

		it( 'logs the persisted errorReason with a stored error on a document arrival', () => {
			( useSiteSetupError as jest.Mock ).mockReturnValue( { error: 'Unsupported plan' } );
			setNavigationType( 'navigate' );

			render( { data: { previousStep: 'processing', errorReason: 'processing_failed' } } );

			expect( loggedError() ).toBe( 'Unsupported plan' );
			expect( loggedExtra() ).toMatchObject( {
				error_reason: 'processing_failed',
				is_flow_arrival: false,
			} );
		} );

		it( 'logs document_back_forward for a history arrival', () => {
			setNavigationType( 'back_forward' );

			render();

			expect( loggedError() ).toBe( 'document_back_forward' );
		} );

		it( 'logs document_load for a navigation or a missing entry', () => {
			setNavigationType( 'navigate' );
			render();
			expect( loggedError() ).toBe( 'document_load' );

			jest.clearAllMocks();
			setNavigationType();
			render();
			expect( loggedError() ).toBe( 'document_load' );
		} );
	} );

	it( 'adds the previous step and the raw errorReason to the extra data', () => {
		render( {
			data: { previousStep: 'setup-your-site-ai', errorReason: 'build_wow_start_failed' },
		} );

		expect( logToLogstash ).toHaveBeenCalledWith(
			expect.objectContaining( {
				extra: expect.objectContaining( {
					previous_step: 'setup-your-site-ai',
					error_reason: 'build_wow_start_failed',
				} ),
			} )
		);
	} );

	it( 'does not show the errorReason to the customer', () => {
		( useSiteSetupError as jest.Mock ).mockReturnValue( { error: undefined, message: undefined } );

		const { container } = render( {
			data: { previousStep: 'processing', errorReason: 'processing_failed' },
		} );

		expect( loggedError() ).toBe( 'processing_failed' );
		expect( container.querySelector( '.error-step__message' ) ).toBeNull();
		expect( container ).not.toHaveTextContent( 'processing_failed' );
	} );
} );
