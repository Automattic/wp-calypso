/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import React from 'react';
import SiteMigrationReview from '..';
import { StepProps } from '../../../types';
import { mockStepProps, renderStep } from '../../test/helpers';

const flowState: Record< string, unknown > = {};

jest.mock( '../../../state-manager/store', () => ( {
	useFlowState: () => ( {
		get: ( key: string ) => flowState[ key ],
		set: ( key: string, value: unknown ) => {
			flowState[ key ] = value;
		},
		sessionId: null,
	} ),
} ) );

const RUN_ID = 'run-123';

const mockApi = () => nock( 'https://public-api.wordpress.com:443' );

const analysis = {
	site: { title: 'Terra & Twine', host: 'terraandtwine.com' },
	findings: [],
	verdict: { level: 'complete', text: 'We found everything.' },
	counts: { pages: 12, posts: 8, images: 42 },
};

const mockSwitchRun = () =>
	mockApi().get( `/wpcom/v2/switch-runs/${ RUN_ID }` ).reply( 200, {
		run_id: RUN_ID,
		state: 'analysis_ready',
		created_at: '2026-01-01',
		updated_at: '2026-01-01',
		expires_at: '2026-01-06',
		analysis,
	} );

const render = ( props?: Partial< StepProps > ) => {
	const queryClient = new QueryClient( {
		defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
	} );

	const combinedProps = mockStepProps( {
		stepName: 'site-migration-review',
		flow: 'site-migration',
		...props,
	} );

	return renderStep(
		<QueryClientProvider client={ queryClient }>
			<SiteMigrationReview { ...combinedProps } />
		</QueryClientProvider>,
		{ initialEntry: '/site-migration-review?siteId=123&from=https%3A%2F%2Fterraandtwine.com' }
	);
};

describe( 'SiteMigrationReview', () => {
	beforeAll( () => nock.disableNetConnect() );

	beforeEach( () => {
		Object.keys( flowState ).forEach( ( key ) => delete flowState[ key ] );
		flowState[ 'site-migration-scan' ] = { action: 'continue', runId: RUN_ID };
		flowState[ 'site-migration-destination' ] = { destination: 'wpcom' };
		flowState[ 'site-migration-domain' ] = { choice: 'keep' };
		flowState.plans = { stepName: 'plans', cartItems: [ { product_slug: 'business-bundle' } ] };
	} );

	afterEach( () => {
		jest.clearAllMocks();
		nock.cleanAll();
	} );

	afterAll( () => nock.enableNetConnect() );

	it( 'summarises the choices made earlier in the flow', async () => {
		mockSwitchRun();
		render();

		expect( screen.getByRole( 'heading', { name: 'Review your migration' } ) ).toBeVisible();

		await waitFor( () => expect( screen.getByText( 'Terra & Twine' ) ).toBeVisible() );

		expect( screen.getByText( 'WordPress.com' ) ).toBeVisible();
		expect( screen.getByText( 'Keep terraandtwine.com' ) ).toBeVisible();
		expect( screen.getByText( 'Business' ) ).toBeVisible();
		expect( screen.getByText( '12 pages' ) ).toBeVisible();
		expect( screen.getByText( '8 posts' ) ).toBeVisible();
		expect( screen.getByText( '42 images' ) ).toBeVisible();
	} );

	it( 'uses the analysis the scan step left in flow state without re-reading the run', () => {
		flowState[ 'site-migration-scan' ] = { action: 'continue', runId: RUN_ID, analysis };
		render();

		expect( screen.getByText( 'Terra & Twine' ) ).toBeVisible();
		expect( screen.getByText( '12 pages' ) ).toBeVisible();
		expect( nock.pendingMocks() ).toHaveLength( 0 );
	} );

	it( 'submits the migrate action when the primary button is pressed', async () => {
		mockSwitchRun();
		const submit = jest.fn();
		render( { navigation: { submit } } );

		await userEvent.click( screen.getByRole( 'button', { name: 'Migrate' } ) );

		expect( submit ).toHaveBeenCalledWith( { action: 'migrate' } );
	} );

	it( 'renders fallbacks when the user lands on the step without any earlier choices', () => {
		Object.keys( flowState ).forEach( ( key ) => delete flowState[ key ] );
		render();

		expect( screen.getByRole( 'heading', { name: 'Review your migration' } ) ).toBeVisible();
		expect( screen.getAllByText( 'Not selected yet' ).length ).toBeGreaterThan( 0 );
		expect( screen.getByRole( 'button', { name: 'Migrate' } ) ).toBeVisible();
	} );
} );
