/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues
import React from 'react';
import { useSiteDomains } from 'calypso/landing/stepper/hooks/use-site-domains';
import { useSiteSetupError } from 'calypso/landing/stepper/hooks/use-site-setup-error';
import { bumpStat } from 'calypso/lib/analytics/mc';
import { logToLogstash } from 'calypso/lib/logstash';
import ErrorStep from '../';
import { StepProps } from '../../../types';
import { mockStepProps, renderStep, RenderStepOptions } from '../../test/helpers/index';

jest.mock( 'calypso/landing/stepper/hooks/use-site-domains' );
jest.mock( 'calypso/landing/stepper/hooks/use-site-setup-error' );
jest.mock( 'calypso/lib/analytics/mc', () => ( {
	bumpStat: jest.fn(),
} ) );
jest.mock( 'calypso/lib/logstash' );

describe( 'ErrorStep', () => {
	const render = ( props?: Partial< StepProps >, renderOptions?: RenderStepOptions ) => {
		const combinedProps = { ...mockStepProps( { flow: 'onboarding', ...props } ) };
		return renderStep( <ErrorStep { ...combinedProps } />, {
			initialState: { currentUser: { user: { localeSlug: 'en' } } },
			...renderOptions,
		} );
	};

	beforeEach( () => {
		jest.clearAllMocks();
		( useSiteDomains as jest.Mock ).mockReturnValue( null );
		( useSiteSetupError as jest.Mock ).mockReturnValue( {
			error: 'site_setup_failed',
			message: 'Something went wrong',
		} );
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
			},
			properties: {
				flow: 'onboarding',
				locale: 'en',
				error: 'no_stored_error',
			},
		} );
	} );
} );
