/**
 * @jest-environment jsdom
 */
import { isEnabled } from '@automattic/calypso-config';
import { PLAN_ECOMMERCE } from '@automattic/calypso-products';
import { NEW_HOSTED_SITE_FLOW, SITE_MIGRATION_FLOW } from '@automattic/onboarding';
import { waitFor } from '@testing-library/react';
import React, { useEffect, useState } from 'react';
import { MemoryRouter, useNavigate } from 'react-router';
import { HOW_TO_MIGRATE_OPTIONS } from 'calypso/landing/stepper/constants';
import { STEPS } from 'calypso/landing/stepper/declarative-flow/internals/steps';
import { SESSION_KEY_FROM_PLAYGROUND_PUBLISH } from 'calypso/landing/stepper/declarative-flow/internals/steps-repository/playground/lib/constants';
import { ProcessingResult } from 'calypso/landing/stepper/declarative-flow/internals/steps-repository/processing-step/constants';
import { AssertConditionState } from 'calypso/landing/stepper/declarative-flow/internals/types';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import entrepreneurFlow from '../entrepreneur-flow';
import type {
	AssertConditionResult,
	StepperStep,
} from 'calypso/landing/stepper/declarative-flow/internals/types';

const SITE_ID = 123;
const SITE_SLUG = 'ecom-example.wordpress.com';
const REDIRECT_FLAG = 'entrepreneur/redirect-to-commerce-purchase';

// `@automattic/calypso-products` calls `isEnabled` while it loads, before a top-level
// `mockIsEnabled` would exist, so the mock is created inside the factory.
jest.mock( '@automattic/calypso-config', () =>
	Object.assign( jest.fn(), { isEnabled: jest.fn( () => false ) } )
);
const mockIsEnabled = isEnabled as jest.Mock;

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

let assertResult: AssertConditionResult | undefined;

const AssertConditions = () => {
	assertResult = entrepreneurFlow.useAssertConditions?.();
	return null;
};

const renderAssertConditions = ( path: string ) =>
	renderWithProvider(
		<MemoryRouter initialEntries={ [ path ] }>
			<AssertConditions />
		</MemoryRouter>
	);

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
		mockIsEnabled.mockReturnValue( false );
		sessionStorage.clear();
		assertResult = undefined;
	} );

	describe( 'redirect to the Commerce purchase path', () => {
		beforeEach( () => {
			mockIsEnabled.mockImplementation( ( flag: string ) => flag === REDIRECT_FLAG );
		} );

		it( 'sends a visitor on the survey step to the Commerce purchase path and keeps the query string', async () => {
			renderAssertConditions(
				`/${ entrepreneurFlow.name }/start?ref=partner&utm_source=ads&plan=personal-bundle`
			);

			await waitFor( () => {
				expect( window.location.replace ).toHaveBeenCalledTimes( 1 );
			} );

			const destination = new URL(
				( window.location.replace as jest.Mock ).mock.calls[ 0 ][ 0 ],
				'https://wordpress.com'
			);

			expect( destination.pathname ).toBe( `/setup/${ NEW_HOSTED_SITE_FLOW }` );
			expect( Object.fromEntries( destination.searchParams ) ).toEqual( {
				ref: 'partner',
				utm_source: 'ads',
				plan: PLAN_ECOMMERCE,
			} );
			expect( assertResult?.state ).toBe( AssertConditionState.CHECKING );
		} );

		it.each( [
			[ 'the URL has no step', `/${ entrepreneurFlow.name }` ],
			[ 'the step is user', `/${ entrepreneurFlow.name }/user` ],
			[
				`the step is ${ STEPS.TRIAL_ACKNOWLEDGE.slug }`,
				`/${ entrepreneurFlow.name }/${ STEPS.TRIAL_ACKNOWLEDGE.slug }`,
			],
			[
				`the step is ${ STEPS.SITE_CREATION_STEP.slug }`,
				`/${ entrepreneurFlow.name }/${ STEPS.SITE_CREATION_STEP.slug }`,
			],
		] )( 'redirects when %s', async ( _label, path ) => {
			renderAssertConditions( path );

			await waitFor( () => {
				expect( window.location.replace ).toHaveBeenCalledTimes( 1 );
			} );
			expect( assertResult?.state ).toBe( AssertConditionState.CHECKING );
		} );

		it.each( [
			[ `/${ entrepreneurFlow.name }/start/es`, `/setup/${ NEW_HOSTED_SITE_FLOW }/es` ],
			[ `/${ entrepreneurFlow.name }/es`, `/setup/${ NEW_HOSTED_SITE_FLOW }/es` ],
		] )( 'keeps the locale when redirecting from %s', async ( path, expectedPathname ) => {
			renderAssertConditions( path );

			await waitFor( () => {
				expect( window.location.replace ).toHaveBeenCalledTimes( 1 );
			} );

			const destination = new URL(
				( window.location.replace as jest.Mock ).mock.calls[ 0 ][ 0 ],
				'https://wordpress.com'
			);

			expect( destination.pathname ).toBe( expectedPathname );
		} );

		it.each( [
			[
				'the Playground publish path',
				`/${ entrepreneurFlow.name }/start?from=playground-publish`,
			],
			...[
				STEPS.PROCESSING,
				STEPS.WAIT_FOR_ATOMIC,
				STEPS.WAIT_FOR_PLUGIN_INSTALL,
				STEPS.IMPORTER_PLAYGROUND,
				STEPS.ERROR,
			].map( ( step ) => [
				`the ${ step.slug } step`,
				`/${ entrepreneurFlow.name }/${ step.slug }`,
			] ),
		] )( 'does not redirect on %s', ( _label, path ) => {
			renderAssertConditions( path );

			expect( window.location.replace ).not.toHaveBeenCalled();
			expect( assertResult?.state ).toBe( AssertConditionState.SUCCESS );
		} );

		it( 'does not redirect when the Playground session flag survives the login round trip', () => {
			sessionStorage.setItem( SESSION_KEY_FROM_PLAYGROUND_PUBLISH, '1' );

			renderAssertConditions( `/${ entrepreneurFlow.name }/${ STEPS.SITE_CREATION_STEP.slug }` );

			expect( window.location.replace ).not.toHaveBeenCalled();
			expect( assertResult?.state ).toBe( AssertConditionState.SUCCESS );
		} );
	} );

	it( 'does not redirect when the flag is off', () => {
		renderAssertConditions( `/${ entrepreneurFlow.name }/start` );

		expect( window.location.replace ).not.toHaveBeenCalled();
		expect( assertResult?.state ).toBe( AssertConditionState.SUCCESS );
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
