/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { screen } from '@testing-library/react';
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

const analysis = {
	site: { title: 'Terra & Twine', host: 'terraandtwine.com' },
	findings: [],
	verdict: { level: 'complete', text: 'We found everything.' },
	counts: { pages: 12, posts: 8, images: 42 },
};

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
		flowState[ 'site-migration-scan' ] = { action: 'continue', analysis };
		flowState[ 'site-migration-destination' ] = { destination: 'wpcom' };
		flowState[ 'site-migration-domain' ] = { choice: 'keep' };
		flowState.plans = { stepName: 'plans', cartItems: [ { product_slug: 'business-bundle' } ] };
	} );

	afterEach( () => {
		jest.clearAllMocks();
		nock.cleanAll();
	} );

	afterAll( () => nock.enableNetConnect() );

	it( 'summarises the choices made earlier in the flow', () => {
		render();

		expect( screen.getByRole( 'heading', { name: 'Review your migration' } ) ).toBeVisible();
		expect( screen.getByText( 'Terra & Twine' ) ).toBeVisible();
		expect( screen.getByText( 'WordPress.com' ) ).toBeVisible();
		expect( screen.getByText( 'Keep terraandtwine.com' ) ).toBeVisible();
		expect( screen.getByText( 'Business' ) ).toBeVisible();
		expect( screen.getByText( '12 pages' ) ).toBeVisible();
		expect( screen.getByText( '8 posts' ) ).toBeVisible();
		expect( screen.getByText( '42 images' ) ).toBeVisible();
	} );

	it( 'falls back to the source URL while the scan step is parked', () => {
		delete flowState[ 'site-migration-scan' ];
		render();

		// No analysis to read, and nothing asked for one.
		expect( screen.getByText( 'https://terraandtwine.com' ) ).toBeVisible();
		expect( screen.getByText( 'We’ll confirm this once your site has been read.' ) ).toBeVisible();
		expect( screen.getByText( 'Keep your current address' ) ).toBeVisible();
	} );

	it( 'submits the migrate action when the primary button is pressed', async () => {
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
