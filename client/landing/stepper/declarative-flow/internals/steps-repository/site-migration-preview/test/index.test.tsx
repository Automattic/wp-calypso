/**
 * @jest-environment jsdom
 */
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { useFlowState } from 'calypso/landing/stepper/declarative-flow/internals/state-manager/store';
import SiteMigrationPreview from '..';
import { StepProps } from '../../../types';
import { mockStepProps, renderStep } from '../../test/helpers';
import type { SwitchRunPreview } from '@automattic/api-core';

jest.mock( 'calypso/landing/stepper/declarative-flow/internals/state-manager/store', () => ( {
	useFlowState: jest.fn(),
} ) );

jest.mock(
	'../../site-migration-instructions/site-preview/hooks/use-site-preview-mshot-image-handler',
	() => ( {
		useSitePreviewMShotImageHandler: () => ( { createScreenshots: jest.fn() } ),
	} )
);

const get = jest.fn();
const set = jest.fn();

const mockApi = () => nock( 'https://public-api.wordpress.com:443' );

const FROM = 'https://terraandtwine.com';
const RUN_ID = 'run-123';

const READY_PREVIEW: SwitchRunPreview = {
	state: 'ready',
	preview_url: 'https://terraandtwine-preview.wordpress.com',
	source_url: FROM,
	match: {
		layout: true,
		fonts: true,
		images: { matched: 40, total: 42 },
		pages: { matched: 12, total: 12 },
	},
};

const render = ( props?: Partial< StepProps >, initialEntry?: string ) =>
	renderStep( <SiteMigrationPreview { ...mockStepProps( props ) } />, {
		initialEntry:
			initialEntry ??
			`/site-migration-preview?from=${ encodeURIComponent(
				FROM
			) }&platform=wix&switchRunId=${ RUN_ID }`,
	} );

describe( 'SiteMigrationPreview', () => {
	beforeAll( () => nock.disableNetConnect() );

	beforeEach( () => {
		jest.clearAllMocks();
		nock.cleanAll();
		get.mockReturnValue( undefined );
		jest.mocked( useFlowState ).mockReturnValue( {
			get,
			set,
			sessionId: 'session',
		} as unknown as ReturnType< typeof useFlowState > );
	} );

	it( 'shows a building state and then the finished preview', async () => {
		jest.useFakeTimers();

		mockApi()
			.get( `/wpcom/v2/switch-runs/${ RUN_ID }/preview` )
			.query( true )
			.reply( 200, { state: 'building' } );

		mockApi()
			.get( `/wpcom/v2/switch-runs/${ RUN_ID }/preview` )
			.query( true )
			.reply( 200, READY_PREVIEW );

		render();

		await waitFor( () => expect( screen.getByText( 'Building your preview…' ) ).toBeVisible(), {
			timeout: 15000,
		} );

		await waitFor(
			() => expect( screen.queryByText( 'Building your preview…' ) ).not.toBeInTheDocument(),
			{ timeout: 15000 }
		);

		expect( screen.getByText( 'Showing your site on WordPress.com' ) ).toBeVisible();

		jest.useRealTimers();
	} );

	it( 'renders a match badge for every part of the comparison', async () => {
		mockApi()
			.get( `/wpcom/v2/switch-runs/${ RUN_ID }/preview` )
			.query( true )
			.reply( 200, READY_PREVIEW );

		render();

		await waitFor( () => expect( screen.getByText( 'Layout matches' ) ).toBeVisible() );

		expect( screen.getByText( 'Fonts matched' ) ).toBeVisible();
		expect( screen.getByText( '40 of 42 images' ) ).toBeVisible();
		expect( screen.getByText( '12 of 12 pages' ) ).toBeVisible();
	} );

	it( 'toggles between the source site and the WordPress.com preview', async () => {
		mockApi()
			.get( `/wpcom/v2/switch-runs/${ RUN_ID }/preview` )
			.query( true )
			.reply( 200, READY_PREVIEW );

		render();

		await waitFor( () =>
			expect( screen.getByText( 'Showing your site on WordPress.com' ) ).toBeVisible()
		);

		const sourceOption = screen.getByRole( 'radio', { name: 'Your Wix site' } );
		expect( sourceOption ).not.toBeChecked();

		await userEvent.click( sourceOption );

		expect( sourceOption ).toBeChecked();
		expect( screen.getByText( 'Showing your Wix site' ) ).toBeVisible();
	} );

	it( 'toggles between desktop and mobile', async () => {
		mockApi()
			.get( `/wpcom/v2/switch-runs/${ RUN_ID }/preview` )
			.query( true )
			.reply( 200, READY_PREVIEW );

		render();

		await waitFor( () => expect( screen.getByText( 'Layout matches' ) ).toBeVisible() );

		const mobileOption = screen.getByRole( 'radio', { name: 'Mobile' } );
		await userEvent.click( mobileOption );

		expect( mobileOption ).toBeChecked();
		expect( screen.getByRole( 'radio', { name: 'Desktop' } ) ).not.toBeChecked();
	} );

	it( 'submits continue and white-glove from the two calls to action', async () => {
		const submit = jest.fn();

		mockApi()
			.get( `/wpcom/v2/switch-runs/${ RUN_ID }/preview` )
			.query( true )
			.reply( 200, READY_PREVIEW );

		render( { navigation: { submit } } );

		await waitFor( () => expect( screen.getByText( 'Layout matches' ) ).toBeVisible() );

		await userEvent.click( screen.getByRole( 'button', { name: 'Get a white-glove migration' } ) );
		expect( submit ).toHaveBeenCalledWith( { action: 'white-glove' } );

		await userEvent.click( screen.getByRole( 'button', { name: 'This looks right — continue' } ) );
		expect( submit ).toHaveBeenCalledWith( { action: 'continue' } );
	} );

	it( 'reassures the user that nothing goes live yet', async () => {
		mockApi()
			.get( `/wpcom/v2/switch-runs/${ RUN_ID }/preview` )
			.query( true )
			.reply( 200, READY_PREVIEW );

		render();

		expect( screen.getByText( 'Nothing goes live until you hit Migrate.' ) ).toBeVisible();
	} );

	it( 'resumes the run held in flow state when the URL has lost it', async () => {
		get.mockImplementation( ( key: string ) =>
			key === 'site-migration-scan' ? { action: 'continue', runId: 'stored-run' } : undefined
		);

		mockApi()
			.get( '/wpcom/v2/switch-runs/stored-run/preview' )
			.query( true )
			.reply( 200, READY_PREVIEW );

		render( {}, `/site-migration-preview?from=${ encodeURIComponent( FROM ) }&platform=wix` );

		await waitFor( () => expect( screen.getByText( 'Layout matches' ) ).toBeVisible() );
	} );
} );
