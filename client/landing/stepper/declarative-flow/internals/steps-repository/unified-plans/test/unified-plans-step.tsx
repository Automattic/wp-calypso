/** @vitest-environment jsdom */
// @ts-nocheck - TODO: Fix TypeScript issues
import { PLAN_BUSINESS } from '@automattic/calypso-products';
import {
	EDUCATION_FLOW,
	SITE_MIGRATION_FLOW,
	STATIC_SITE_IMPORT_FLOW,
} from '@automattic/onboarding';
import { screen, waitFor } from '@testing-library/react';
import { dispatch } from '@wordpress/data';
import React from 'react';
import { vi } from 'vitest';
import DocumentHead from 'calypso/components/data/document-head';
import { SITE_STORE } from 'calypso/landing/stepper/stores';
import {
	clearSignupCompleteSiteID,
	clearSignupCompleteSlug,
	setSignupCompleteSiteID,
	setSignupCompleteSlug,
} from 'calypso/signup/storageUtils';
import PlansStepAdaptor from '..';
import * as flowState from '../../../state-manager/store';
import { renderStep } from '../../test/helpers';
import UnifiedPlansStep, { type UnifiedPlansStepProps } from '../unified-plans-step';
import * as unifiedPlansModule from '../unified-plans-step';

vi.mock( 'calypso/signup/step-wrapper', () => ( {
	default: () => <div data-testid="start-step-wrapper" />,
} ) );
vi.mock( '@automattic/onboarding/src/step-container', () => ( {
	default: () => <div data-testid="stepper-step-wrapper" />,
} ) );
vi.mock( '@automattic/onboarding/src/step-container-v2/wireframes/WideLayout/WideLayout', () => ( {
	WideLayout: () => null,
} ) );
vi.mock( 'calypso/components/marketing-message', () => ( { default: 'marketing-message' } ) );
vi.mock( 'calypso/lib/wp', () =>
	( ( m ) => ( { ...m, default: m } ) )( { req: { post: () => {} } } )
);

const noop = () => {};

const props = {
	flowName: 'Flow name',
	stepName: 'Step name',
	stepSectionName: 'Step section name',
	signupDependencies: { domainItem: null },
	saveSignupStep: noop,
	submitSignupStep: noop,
	goToNextStep: noop,
	onPlanIntervalUpdate: noop,
	wrapperProps: {
		hideBack: false,
		goBack: noop,
		isFullLayout: true,
		isExtraWideLayout: true,
	},
};

const _render = ( props: UnifiedPlansStepProps ) => {
	return renderStep( <UnifiedPlansStep { ...props } /> );
};

describe( 'Plans basic tests', () => {
	beforeEach( () => {
		vi.clearAllMocks();
	} );

	test( 'should not blow up in Start and have proper CSS class', async () => {
		_render( props );
		const stepWrapper = await waitFor( () => screen.getByTestId( 'start-step-wrapper' ) );
		expect( stepWrapper ).toBeVisible();
		expect( stepWrapper.parentNode ).toHaveClass( 'plans-step' );
	} );

	test( 'should not blow up in Stepper and have proper CSS class', async () => {
		_render( { ...props, useStepperWrapper: true } );
		const stepWrapper = await waitFor( () => screen.getByTestId( 'stepper-step-wrapper' ) );
		expect( stepWrapper ).toBeVisible();
		expect( stepWrapper.parentNode ).toHaveClass( 'plans-step' );
	} );

	test.each( [
		[ SITE_MIGRATION_FLOW, 'Ready to migrate' ],
		[ EDUCATION_FLOW, 'Existing flow title' ],
	] )( 'scopes the plans document title to migration (%s)', async ( flowName, expectedTitle ) => {
		renderStep(
			<>
				<DocumentHead title="Existing flow title" />
				<UnifiedPlansStep
					{ ...props }
					flowName={ flowName }
					headerText="Ready to migrate"
					useStepperWrapper
					useStepContainerV2
				/>
			</>
		);
		await waitFor( () => expect( document.title ).toContain( expectedTitle ) );
	} );
} );

describe( 'Plans accepts-props', () => {
	beforeEach( () => {
		vi.clearAllMocks();
	} );

	test( 'renders with copy overrides, hide toggles, interval, and tag overrides without blowing up', async () => {
		_render( {
			...props,
			useStepperWrapper: true,
			headerText: 'Custom plans header',
			subHeaderText: 'Custom plans subheader',
			hideFreePlan: true,
			hideEnterprisePlan: true,
			hidePersonalPlan: true,
			hidePremiumPlan: true,
			hideEcommercePlan: true,
			hidePlanTypeSelector: true,
			intervalType: '2yearly',
			highlightLabelOverrides: { [ PLAN_BUSINESS ]: 'Best for stores' },
			titleBadgeOverrides: { [ PLAN_BUSINESS ]: 'Team favorite' },
			taglineOverrides: { [ PLAN_BUSINESS ]: 'Best for scaling stores' },
		} );
		const stepWrapper = await waitFor( () => screen.getByTestId( 'stepper-step-wrapper' ) );
		expect( stepWrapper ).toBeVisible();
		expect( stepWrapper.parentNode ).toHaveClass( 'plans-step' );
	} );
} );

describe( 'Plans site context', () => {
	const previousSite = { ID: 987, URL: 'https://previous.wordpress.com' };
	const destination = { ID: 654, URL: 'https://destination.wordpress.com' };

	beforeEach( () => {
		setSignupCompleteSlug( 'previous.wordpress.com' );
		setSignupCompleteSiteID( previousSite.ID );
		vi.spyOn( flowState, 'useFlowState' ).mockReturnValue( {
			get: ( key ) => ( key === 'site' ? { siteId: previousSite.ID } : undefined ),
		} );
		for ( const site of [ previousSite, destination ] ) {
			dispatch( SITE_STORE ).receiveSite( site.ID, site );
			for ( const fragment of [ site.ID, String( site.ID ), new URL( site.URL ).host ] ) {
				dispatch( SITE_STORE ).finishResolution( 'getSite', [ fragment ] );
			}
		}
	} );

	afterEach( () => {
		clearSignupCompleteSlug();
		clearSignupCompleteSiteID();
		vi.restoreAllMocks();
	} );

	it.each( [
		[
			SITE_MIGRATION_FLOW,
			'siteId=654&siteSlug=destination.wordpress.com',
			destination,
			'destination.wordpress.com',
		],
		[ SITE_MIGRATION_FLOW, '', undefined, null ],
		[ STATIC_SITE_IMPORT_FLOW, '', undefined, null ],
		[
			STATIC_SITE_IMPORT_FLOW,
			`siteId=${ destination.ID }&siteSlug=${ new URL( destination.URL ).host }`,
			destination,
			new URL( destination.URL ).host,
		],
		[ 'onboarding', '', previousSite, 'previous.wordpress.com' ],
	] )(
		'resolves %s plans with destination "%s" despite saved signup state',
		async ( flow, query, expectedSite, expectedSlug ) => {
			const plans = vi.spyOn( unifiedPlansModule, 'default' ).mockImplementation( () => null );
			renderStep( <PlansStepAdaptor flow={ flow } navigation={ { submit: vi.fn() } } />, {
				initialEntry: `/setup/${ flow }/plans?${ query }`,
				initialState: {
					sites: { items: { [ previousSite.ID ]: previousSite, [ destination.ID ]: destination } },
				},
			} );
			await waitFor( () =>
				expect( plans.mock.lastCall?.[ 0 ] ).toMatchObject( {
					selectedSite: expectedSite,
					signupDependencies: { siteSlug: expectedSlug },
				} )
			);
		}
	);
} );
