/**
 * @jest-environment jsdom
 */
import { SITE_MIGRATION_FLOW } from '@automattic/onboarding';
import { waitFor } from '@testing-library/react';
import React, { useEffect, useState } from 'react';
import { MemoryRouter, useNavigate } from 'react-router';
import { HOW_TO_MIGRATE_OPTIONS } from 'calypso/landing/stepper/constants';
import { STEPS } from 'calypso/landing/stepper/declarative-flow/internals/steps';
import { ProcessingResult } from 'calypso/landing/stepper/declarative-flow/internals/steps-repository/processing-step/constants';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import entrepreneurFlow from '../entrepreneur-flow';
import type { StepperStep } from 'calypso/landing/stepper/declarative-flow/internals/types';

const SITE_ID = 123;
const SITE_SLUG = 'ecom-example.wordpress.com';

jest.mock( 'calypso/landing/stepper/hooks/use-site-data', () => ( {
	useSiteData: () => ( {
		site: null,
		siteId: SITE_ID,
		siteSlug: SITE_SLUG,
		siteSlugOrId: SITE_SLUG,
	} ),
} ) );

jest.mock( 'calypso/data/segmentaton-survey', () => ( {
	anonIdCache: { store: jest.fn(), get: jest.fn(), clear: jest.fn(), pop: jest.fn() },
	useCachedAnswers: () => ( { clearAnswers: jest.fn() } ),
} ) );

/**
 * `isMigrationFlow` is React state inside `useStepNavigation`, set by the survey step's
 * submit. To exercise the processing step's migration branch, the same hook instance has to
 * submit the survey step first and then the processing step.
 */
const SurveyThenProcessing = () => {
	const navigate = useNavigate();
	// The flow registers the survey step under `start`, which is not a listed step slug. Use the
	// same cast the flow does.
	const [ currentStep, setCurrentStep ] = useState( 'start' as StepperStep[ 'slug' ] );
	const { submit } = entrepreneurFlow.useStepNavigation( currentStep, ( path, state ) =>
		navigate( path, { state } )
	);

	useEffect( () => {
		if ( currentStep === ( 'start' as StepperStep[ 'slug' ] ) ) {
			submit?.( { isMigrationFlow: true } );
			setCurrentStep( STEPS.PROCESSING.slug );
			return;
		}

		submit?.( { processingResult: ProcessingResult.SUCCESS, pluginsInstalled: true } );
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ currentStep ] );

	return null;
};

describe( 'Entrepreneur Flow', () => {
	const originalLocation = window.location;

	beforeAll( () => {
		Object.defineProperty( window, 'location', {
			value: { ...originalLocation, assign: jest.fn(), replace: jest.fn() },
			writable: true,
			configurable: true,
		} );
	} );

	afterAll( () => {
		Object.defineProperty( window, 'location', {
			value: originalLocation,
			writable: true,
			configurable: true,
		} );
	} );

	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'sends a migrating user to the site-migration upgrade step for the trial site once WooCommerce is installed', async () => {
		renderWithProvider(
			<MemoryRouter initialEntries={ [ `/${ entrepreneurFlow.name }/start` ] }>
				<SurveyThenProcessing />
			</MemoryRouter>,
			{ initialState: { currentUser: { id: 1 } } }
		);

		await waitFor( () => {
			expect( window.location.assign ).toHaveBeenCalledTimes( 1 );
		} );

		const destination = new URL(
			( window.location.assign as jest.Mock ).mock.calls[ 0 ][ 0 ],
			'https://wordpress.com'
		);

		expect( destination.pathname ).toBe(
			`/setup/${ SITE_MIGRATION_FLOW }/${ STEPS.SITE_MIGRATION_UPGRADE_PLAN.slug }`
		);
		expect( destination.pathname ).not.toContain( STEPS.SITE_CREATION_STEP.slug );
		expect( Object.fromEntries( destination.searchParams ) ).toEqual( {
			siteSlug: SITE_SLUG,
			siteId: String( SITE_ID ),
			ref: 'entrepreneur-signup',
			how: HOW_TO_MIGRATE_OPTIONS.DO_IT_FOR_ME,
		} );
	} );
} );
