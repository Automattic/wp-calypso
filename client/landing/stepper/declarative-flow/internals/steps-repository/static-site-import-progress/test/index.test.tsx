/**
 * @jest-environment jsdom
 */
import { screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import { MemoryRouter } from 'react-router';
import { useStaticSiteImport } from 'calypso/dashboard/sites/static-site-import/use-static-site-import';
import { startWowFunnelSite } from 'calypso/landing/stepper/utils/wow-funnel-site';
import documentHeadReducer from 'calypso/state/document-head/reducer';
import uiReducer from 'calypso/state/ui/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import StaticSiteImportProgressStep from '..';
import { mockStepProps } from '../../test/helpers';
import type { StaticSiteImportProgressStartedImport } from '..';
import type { StaticSiteImport } from 'calypso/dashboard/sites/static-site-import/use-static-site-import';

jest.mock( 'calypso/dashboard/sites/static-site-import/use-static-site-import', () => ( {
	...jest.requireActual( 'calypso/dashboard/sites/static-site-import/use-static-site-import' ),
	useStaticSiteImport: jest.fn(),
} ) );

jest.mock( 'calypso/landing/stepper/utils/wow-funnel-site', () => ( {
	startWowFunnelSite: jest.fn(),
} ) );

const mockApi = () => nock( 'https://public-api.wordpress.com:443' );

const STARTED: StaticSiteImportProgressStartedImport = {
	action: 'started',
	importSessionId: 'abc123',
	previewSiteId: 456,
	previewSiteSlug: 'preview.wpcomstaging.com',
	sourceUrl: 'https://source.example.com',
};

const MOVE = { from: 'source.example.com', startedImport: STARTED };

type Props = { from?: string; startedImport?: StaticSiteImportProgressStartedImport };

const render = ( siteImport: StaticSiteImport | null, props: Props = MOVE ) => {
	jest.mocked( useStaticSiteImport ).mockReturnValue( siteImport );
	const submit = jest.fn();
	renderWithProvider(
		<MemoryRouter>
			<StaticSiteImportProgressStep
				{ ...mockStepProps( { navigation: { submit }, stepName: 'static-site-import-progress' } ) }
				{ ...props }
			/>
		</MemoryRouter>,
		{ reducers: { documentHead: documentHeadReducer, ui: uiReducer } }
	);
	return submit;
};

describe( 'StaticSiteImportProgressStep', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'shows the move’s steps beside a window onto the site', () => {
		const submit = render( { status: 'moving' } );

		expect( screen.getByRole( 'heading', { name: 'Copying your site' } ) ).toBeVisible();
		expect(
			screen.getByText(
				'We’re copying source.example.com into a private preview on WordPress.com. Your original site stays as it is.'
			)
		).toBeVisible();
		expect( screen.getByText( 'Getting your preview ready' ) ).toBeVisible();
		expect( useStaticSiteImport ).toHaveBeenCalledWith( 456, 'abc123', { approve: false } );
		expect( submit ).not.toHaveBeenCalled();
	} );

	it( 'keeps the colliding cards up in place of the page list and screenshot', () => {
		render( {
			status: 'moving',
			session: {
				state: 'building',
				preview_image_url: 'https://preview.example/shot.png',
				progress: { pages: [ { path: '/', captured: true } ] },
			},
		} as StaticSiteImport );

		expect( document.querySelector( '.static-site-import-colliding-cards' ) ).toBeVisible();
		expect(
			document.querySelector( '.static-site-import-snapshot__pages' )
		).not.toBeInTheDocument();
		expect(
			document.querySelector( '.static-site-import-snapshot__image' )
		).not.toBeInTheDocument();
	} );

	it( 'submits a finished move', () => {
		const submit = render( { status: 'finished', isPreview: true } );

		expect( submit ).toHaveBeenCalledTimes( 1 );
		expect( submit ).toHaveBeenCalledWith( { action: 'finished' } );
	} );

	it.each( [
		[ 'failed', { status: 'failed' } ],
		[ 'was refused', { status: 'failed', isRefused: true } ],
		[ 'stalled', { status: 'stalled' } ],
		[ 'is unavailable', { status: 'unavailable' } ],
	] as const )( 'submits a move that %s as stopped', ( _name, siteImport ) => {
		const submit = render( siteImport );

		expect( submit ).toHaveBeenCalledWith( { action: 'stopped' } );
	} );

	it( 'submits as stopped when the preview’s ID is unknown', () => {
		const submit = render( null, {
			...MOVE,
			startedImport: { ...STARTED, previewSiteId: undefined },
		} );

		expect( submit ).toHaveBeenCalledWith( { action: 'stopped' } );
	} );

	describe( 'without a started move', () => {
		beforeAll( () => nock.disableNetConnect() );
		afterEach( () => nock.cleanAll() );

		it( 'starts the import onto a new preview, and shows it', async () => {
			mockApi()
				.post( '/wpcom/v2/static-site-import-session' )
				.query( true )
				.reply( 200, { session_id: 'abc123', state: 'capture_queued' } );
			jest.mocked( startWowFunnelSite ).mockResolvedValue( {
				blogId: 456,
				siteSlug: 'preview.wpcomstaging.com',
				funnelSlug: 'preview',
				funnelKey: 'key',
			} );
			const submit = render( { status: 'moving' }, { from: 'source.example.com' } );

			expect( screen.getByRole( 'heading', { name: 'Copying your site' } ) ).toBeVisible();
			await waitFor( () => expect( submit ).toHaveBeenCalledWith( STARTED ) );
			expect( startWowFunnelSite ).toHaveBeenCalledWith( {
				funnelSlug: 'preview',
				funnelArgs: { import_session_id: 'abc123' },
			} );
			expect( useStaticSiteImport ).toHaveBeenLastCalledWith( 456, 'abc123', { approve: false } );
			expect( submit ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'submits that no preview can be built', async () => {
			mockApi()
				.post( '/wpcom/v2/static-site-import-session' )
				.query( true )
				.reply( 200, { session_id: 'abc123', state: 'capture_queued' } );
			jest.mocked( startWowFunnelSite ).mockRejectedValue( new Error( 'nope' ) );
			const submit = render( null, { from: 'source.example.com' } );

			await waitFor( () => expect( submit ).toHaveBeenCalledWith( { action: 'preview_failed' } ) );
		} );

		it( 'submits a WordPress source to migrate', async () => {
			mockApi()
				.post( '/wpcom/v2/static-site-import-session' )
				.query( true )
				.reply( 400, { code: 'static_site_import_source_is_wordpress' } );
			const submit = render( null, { from: 'source.example.com' } );

			await waitFor( () => expect( submit ).toHaveBeenCalledWith( { action: 'migrate' } ) );
			expect( startWowFunnelSite ).not.toHaveBeenCalled();
		} );

		it( 'says a refused source can’t be imported', async () => {
			mockApi()
				.post( '/wpcom/v2/static-site-import-session' )
				.query( true )
				.reply( 400, { code: 'static_site_import_source_refused' } );
			const submit = render( null, { from: 'source.example.com' } );

			expect(
				await screen.findByRole( 'heading', { name: 'We can’t import this site' } )
			).toBeVisible();
			expect( submit ).not.toHaveBeenCalled();
		} );

		it( 'submits as unavailable without a source', () => {
			const submit = render( null, {} );

			expect( submit ).toHaveBeenCalledWith( { action: 'unavailable' } );
		} );
	} );
} );
