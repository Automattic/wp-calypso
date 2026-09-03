/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues
import { TRANSFERRING_HOSTED_SITE_FLOW, ONBOARDING_FLOW } from '@automattic/onboarding';
import { act, screen } from '@testing-library/react';
import { dispatch } from '@wordpress/data';
import React from 'react';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { transferStates } from 'calypso/state/automated-transfer/constants';
import ProcessingStep from '../';
import { mockStepProps, renderStep } from '../../test/helpers/index';

jest.mock( 'calypso/landing/stepper/hooks/use-record-signup-complete', () => ( {
	useRecordSignupComplete: () => jest.fn(),
} ) );
jest.mock( 'calypso/lib/analytics/signup', () => ( {
	recordSignupProcessingScreen: jest.fn(),
} ) );
jest.mock( 'calypso/lib/analytics/tracks', () => ( {
	recordTracksEvent: jest.fn(),
} ) );
jest.mock( 'calypso/landing/stepper/hooks/use-site-slug-param', () => ( {
	useSiteSlugParam: () => 'example.wordpress.com',
} ) );

describe( 'ProcessingStep', () => {
	const render = ( props ) => renderStep( <ProcessingStep { ...mockStepProps( props ) } /> );

	beforeEach( () => {
		jest.clearAllMocks();
		dispatch( ONBOARD_STORE ).setTransferStatus( null );
		dispatch( ONBOARD_STORE ).setTransferStartedAt( null );
	} );

	it( 'shows the transfer wait for a transferring hosted site creation flow', () => {
		dispatch( ONBOARD_STORE ).setTransferStatus( transferStates.ACTIVE );

		render( { flow: TRANSFERRING_HOSTED_SITE_FLOW } );

		expect( screen.getByText( 'Setting up your site' ) ).toBeVisible();
		expect( screen.getByRole( 'status' ).textContent ).toContain(
			'preparing a dedicated server for your site'
		);
		expect( screen.getByRole( 'progressbar' ) ).toHaveAttribute(
			'aria-label',
			'Preparing a dedicated server for your site'
		);
	} );

	it( 'narrates the stage the transfer is actually in', () => {
		dispatch( ONBOARD_STORE ).setTransferStatus( transferStates.RELOCATING );

		render( { flow: TRANSFERRING_HOSTED_SITE_FLOW } );

		expect( screen.getByRole( 'status' ).textContent ).toContain(
			'moving your site to the new server'
		);
	} );

	it( 'offers a way to the site once the transfer wait stalls', () => {
		jest.useFakeTimers();
		dispatch( ONBOARD_STORE ).setTransferStatus( transferStates.COMPLETE );

		render( { flow: TRANSFERRING_HOSTED_SITE_FLOW } );
		act( () => jest.advanceTimersByTime( 95_000 ) );

		expect( screen.getByRole( 'link', { name: 'Go to your site' } ) ).toHaveAttribute(
			'href',
			'/sites/example.wordpress.com'
		);
		jest.useRealTimers();
	} );

	it( 'keeps the generic loading screen for other flows', () => {
		render( { flow: ONBOARDING_FLOW, title: 'Building your site' } );

		expect( screen.queryByText( 'Setting up your site' ) ).not.toBeInTheDocument();
	} );
} );
