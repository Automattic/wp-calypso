/**
 * @jest-environment jsdom
 */
import page from '@automattic/calypso-router';
import { QueryClient } from '@tanstack/react-query';
import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StrictMode } from 'react';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import {
	activateRedesign,
	applyRedesign,
	fetchPreview,
	fetchRedesign,
	generateRedesign,
	openRedesign,
	type Candidate,
	type Redesign,
} from '../api';
import SiteRedesign, { installedPreviewUrl } from '../main';

jest.mock( '@automattic/calypso-router', () => {
	const mock = Object.assign( jest.fn(), { replace: jest.fn(), redirect: jest.fn() } );
	return { __esModule: true, default: mock };
} );
jest.mock( 'calypso/components/data/document-head', () => () => null );
jest.mock( '../api', () => ( {
	...jest.requireActual( '../api' ),
	fetchRedesign: jest.fn(),
	fetchPreview: jest.fn(),
	applyRedesign: jest.fn(),
	openRedesign: jest.fn(),
	generateRedesign: jest.fn(),
	activateRedesign: jest.fn(),
} ) );

const REDESIGN_ID = 'rd_' + '1'.repeat( 32 );
const CHECKOUT_URL =
	'/checkout/example.wordpress.com/personal?redirect_to=' +
	encodeURIComponent(
		`/site-redesign/example.wordpress.com?redesign=${ REDESIGN_ID }&resume=apply`
	);

const candidate = ( n: number, batch = 2 ): Candidate => ( {
	id: `gen_${ String( n ).repeat( 32 ) }`,
	batch,
	status: 'succeeded',
	progress: { step: 'dsl-export', completed: 9, total: 9 },
	error: null,
	routes: [ { path: '/', title: 'Home', type: 'page', id: 1, complete: true } ],
	route_count: 1,
} );

const session = ( overrides: Partial< Redesign > = {} ): Redesign => ( {
	id: REDESIGN_ID,
	site_id: 1,
	status: 'preview_ready',
	candidates: [ candidate( 1 ), candidate( 2 ), candidate( 3 ), candidate( 4 ), candidate( 5, 1 ) ],
	selected: null,
	pending_apply: null,
	eligibility: {
		can_preview: true,
		can_apply: false,
		reason: 'upgrade_required',
		required_plan: 'personal',
	},
	apply: null,
	applied: null,
	...overrides,
} );

const renderPage = (
	resume = false,
	redesignId: string | null = REDESIGN_ID,
	queryClient = new QueryClient()
) =>
	renderWithProvider(
		<SiteRedesign
			siteId={ 1 }
			siteSlug="example.wordpress.com"
			redesignId={ redesignId }
			resume={ resume }
		/>,
		{ queryClient }
	);

const chooseButton = () => screen.getByRole( 'button', { name: 'Choose this one' } );

// Selecting is enough only once the design's preview has rendered.
const selectDesign = async ( name: string, preview: string ) => {
	await userEvent.click( await screen.findByRole( 'button', { name } ) );
	await waitFor( () => expect( screen.getByTitle( preview ) ).toHaveClass( 'is-loaded' ) );
};

describe( 'SiteRedesign', () => {
	beforeEach( () => {
		jest.spyOn( window, 'scrollTo' ).mockImplementation( () => {} );
		jest.mocked( fetchPreview ).mockImplementation( ( _site, _id, generationId ) =>
			Promise.resolve( {
				generation_id: generationId,
				path: '/',
				html: '<p>preview</p>',
				routes: [],
			} )
		);
	} );
	afterEach( () => jest.clearAllMocks() );

	it( 'automatically starts an empty first session once, including in Strict Mode', async () => {
		jest
			.mocked( openRedesign )
			.mockResolvedValue( session( { status: 'interview', candidates: [] } ) );
		jest.mocked( generateRedesign ).mockResolvedValue( session( { status: 'generating' } ) );
		renderWithProvider(
			<StrictMode>
				<SiteRedesign
					siteId={ 1 }
					siteSlug="example.wordpress.com"
					redesignId={ null }
					resume={ false }
				/>
			</StrictMode>
		);

		expect( screen.getByRole( 'status' ) ).toHaveTextContent( 'Getting your designs ready…' );
		await waitFor( () => expect( page.replace ).toHaveBeenCalled() );
		expect( openRedesign ).toHaveBeenCalledTimes( 1 );
		expect( generateRedesign ).toHaveBeenCalledTimes( 1 );
		expect( generateRedesign ).toHaveBeenCalledWith( 1, REDESIGN_ID );
		expect( screen.queryByRole( 'button', { name: 'Show me four designs' } ) ).toBeNull();
	} );

	it.each( [ 'preview_ready', 'generating', 'failed', 'installed' ] as const )(
		'resumes a %s session on entry without generating another batch',
		async ( status ) => {
			jest.mocked( openRedesign ).mockResolvedValue( session( { status } ) );
			renderPage( false, null );

			await waitFor( () =>
				expect( page.replace ).toHaveBeenCalledWith(
					`/site-redesign/example.wordpress.com?redesign=${ REDESIGN_ID }`
				)
			);
			expect( generateRedesign ).not.toHaveBeenCalled();
		}
	);

	it( 'starts an empty session reached by its saved URL', async () => {
		jest
			.mocked( fetchRedesign )
			.mockResolvedValue( session( { status: 'interview', candidates: [] } ) );
		jest.mocked( generateRedesign ).mockResolvedValue( session( { status: 'generating' } ) );
		renderPage();

		expect( await screen.findByText( 'Making new designs from your content…' ) ).toHaveClass(
			'components-visually-hidden'
		);
		expect( generateRedesign ).toHaveBeenCalledTimes( 1 );
		expect( openRedesign ).not.toHaveBeenCalled();
	} );

	it( 'does not generate when preview eligibility is denied', async () => {
		jest.mocked( fetchRedesign ).mockResolvedValue(
			session( {
				status: 'interview',
				candidates: [],
				eligibility: { ...session().eligibility, can_preview: false },
			} )
		);
		renderPage();

		expect(
			await screen.findByText( 'Design previews are not available for this site.' )
		).toBeVisible();
		expect( generateRedesign ).not.toHaveBeenCalled();
	} );

	it( 'retries a failed session only after an explicit click', async () => {
		jest.mocked( fetchRedesign ).mockResolvedValue( session( { status: 'failed' } ) );
		jest.mocked( generateRedesign ).mockResolvedValue( session( { status: 'generating' } ) );
		renderPage();

		const retry = await screen.findByRole( 'button', { name: 'Retry' } );
		expect( generateRedesign ).not.toHaveBeenCalled();
		await userEvent.click( retry );
		expect( await screen.findByText( 'Making new designs from your content…' ) ).toHaveClass(
			'components-visually-hidden'
		);
		expect( generateRedesign ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'offers Retry after an opening error instead of looping', async () => {
		jest.mocked( openRedesign ).mockRejectedValueOnce( new Error( 'Could not open redesign.' ) );
		renderPage( false, null );

		const retry = await screen.findByRole( 'button', { name: 'Retry' } );
		expect(
			screen.getByText( 'Could not open redesign.', { selector: '.components-notice__content' } )
		).toBeVisible();
		expect( openRedesign ).toHaveBeenCalledTimes( 1 );
		jest.mocked( openRedesign ).mockResolvedValue( session() );
		await userEvent.click( retry );
		await waitFor( () => expect( page.replace ).toHaveBeenCalled() );
		expect( openRedesign ).toHaveBeenCalledTimes( 2 );
		expect( generateRedesign ).not.toHaveBeenCalled();
	} );

	it.each( [
		[ 'rolled_back', 'This redesign was rolled back.' ],
		[ 'superseded', 'A newer redesign replaced this one.' ],
	] as const )( 'explains a %s session without an inert Retry', async ( status, message ) => {
		jest.mocked( fetchRedesign ).mockResolvedValue( session( { status } ) );
		renderPage();
		expect( await screen.findByText( message ) ).toBeVisible();
		expect( screen.queryByRole( 'button', { name: 'Retry' } ) ).toBeNull();
	} );

	it( 'reconnects when another request has already started generation', async () => {
		jest
			.mocked( openRedesign )
			.mockResolvedValue( session( { status: 'interview', candidates: [] } ) );
		jest.mocked( generateRedesign ).mockRejectedValue( { code: 'site_redesign_busy' } );
		jest.mocked( fetchRedesign ).mockResolvedValue( session( { status: 'generating' } ) );
		renderPage( false, null );

		await waitFor( () => expect( page.replace ).toHaveBeenCalled() );
		expect( fetchRedesign ).toHaveBeenCalledWith( 1, REDESIGN_ID );
		expect( generateRedesign ).toHaveBeenCalledTimes( 1 );
		expect( screen.queryByRole( 'button', { name: 'Retry' } ) ).toBeNull();
	} );

	it( 'does not automatically repeat a failed generation request', async () => {
		jest
			.mocked( fetchRedesign )
			.mockResolvedValue( session( { status: 'interview', candidates: [] } ) );
		jest.mocked( generateRedesign ).mockRejectedValueOnce( new Error( 'Generation failed.' ) );
		renderPage();

		const retry = await screen.findByRole( 'button', { name: 'Retry' } );
		expect( generateRedesign ).toHaveBeenCalledTimes( 1 );
		jest.mocked( generateRedesign ).mockResolvedValue( session( { status: 'generating' } ) );
		await userEvent.click( retry );
		expect( await screen.findByText( 'Making new designs from your content…' ) ).toHaveClass(
			'components-visually-hidden'
		);
		expect( generateRedesign ).toHaveBeenCalledTimes( 2 );
	} );

	it( 'shows the four candidates of the newest batch in opaque frames', async () => {
		jest.mocked( fetchRedesign ).mockResolvedValue( session() );
		renderPage();

		await waitFor( () => expect( screen.getAllByTitle( /Preview of design/ ) ).toHaveLength( 4 ) );
		const frames = screen.getAllByTitle( /Preview of design/ );
		frames.forEach( ( frame ) => {
			expect( frame ).toHaveAttribute( 'sandbox', 'allow-scripts' );
			expect( frame ).toHaveAttribute( 'srcdoc', '<p>preview</p>' );
		} );
		expect( fetchPreview ).not.toHaveBeenCalledWith( 1, REDESIGN_ID, candidate( 5, 1 ).id );
		const designs = screen.getAllByRole( 'button', { name: /^Design \d of 4$/ } );
		expect( designs ).toHaveLength( 4 );
		designs.forEach( ( design ) => expect( design ).toHaveAttribute( 'aria-pressed', 'false' ) );
	} );

	it( 'starts with nothing selected and the action disabled', async () => {
		jest.mocked( fetchRedesign ).mockResolvedValue( session() );
		renderPage();

		expect( await screen.findByText( 'Select a design' ) ).toBeVisible();
		expect( screen.getByText( 'Nothing selected yet' ) ).toBeVisible();
		expect( screen.queryByText( 'Design 1 of 4' ) ).toBeNull();
		expect( chooseButton() ).toBeDisabled();
		expect( screen.queryByRole( 'button', { name: /Choose design/ } ) ).toBeNull();
	} );

	it( 'selects a design on click without choosing it', async () => {
		jest.mocked( fetchRedesign ).mockResolvedValue( session() );
		renderPage();

		await selectDesign( 'Design 2 of 4', 'Preview of design 2' );

		expect( screen.getByRole( 'button', { name: 'Design 2 of 4' } ) ).toHaveAttribute(
			'aria-pressed',
			'true'
		);
		expect( screen.getByRole( 'button', { name: 'Design 1 of 4' } ) ).toHaveAttribute(
			'aria-pressed',
			'false'
		);
		expect( screen.getByText( 'Design 2 of 4', { selector: 'span' } ) ).toBeVisible();
		expect( screen.getByText( 'Ready to choose' ) ).toBeVisible();
		expect( screen.queryByText( 'Selected' ) ).toBeNull();
		expect( chooseButton() ).toBeEnabled();
		expect( applyRedesign ).not.toHaveBeenCalled();
	} );

	it( 'selects from the keyboard', async () => {
		jest.mocked( fetchRedesign ).mockResolvedValue( session() );
		renderPage();

		const third = await screen.findByRole( 'button', { name: 'Design 3 of 4' } );
		third.focus();
		await userEvent.keyboard( '{Enter}' );

		expect( third ).toHaveAttribute( 'aria-pressed', 'true' );
		expect( applyRedesign ).not.toHaveBeenCalled();
	} );

	it( 'keeps the selected design when polling reorders the batch', async () => {
		const queryClient = new QueryClient();
		jest.mocked( fetchRedesign ).mockResolvedValue( session() );
		renderPage( false, REDESIGN_ID, queryClient );
		jest.mocked( applyRedesign ).mockReturnValue( new Promise( () => {} ) );

		await selectDesign( 'Design 2 of 4', 'Preview of design 2' );
		act( () => {
			queryClient.setQueryData(
				[ 'site-redesign', 1, REDESIGN_ID ],
				session( {
					candidates: [ candidate( 4 ), candidate( 3 ), candidate( 1 ), candidate( 2 ) ],
				} )
			);
		} );

		expect( await screen.findByText( 'Design 4 of 4', { selector: 'span' } ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Design 4 of 4' } ) ).toHaveAttribute(
			'aria-pressed',
			'true'
		);
		await userEvent.click( chooseButton() );
		expect( applyRedesign ).toHaveBeenCalledWith( 1, REDESIGN_ID, candidate( 2 ).id );
	} );

	it( 'drops the selection when its design leaves the batch', async () => {
		const queryClient = new QueryClient();
		jest.mocked( fetchRedesign ).mockResolvedValue( session() );
		renderPage( false, REDESIGN_ID, queryClient );

		await selectDesign( 'Design 4 of 4', 'Preview of design 4' );
		act( () => {
			queryClient.setQueryData(
				[ 'site-redesign', 1, REDESIGN_ID ],
				session( { candidates: [ candidate( 1 ), candidate( 2 ), candidate( 3 ) ] } )
			);
		} );

		expect( await screen.findByText( 'Select a design' ) ).toBeVisible();
		expect( chooseButton() ).toBeDisabled();
	} );

	it( 'switches every preview between desktop and mobile without reloading it', async () => {
		jest.mocked( fetchRedesign ).mockResolvedValue( session() );
		const { container } = renderPage();

		await selectDesign( 'Design 3 of 4', 'Preview of design 3' );
		const frame = screen.getByTitle( 'Preview of design 3' );
		const grid = container.querySelector( '.site-redesign__grid' );
		expect( screen.getByRole( 'button', { name: 'Preview: Desktop' } ) ).toBeVisible();
		expect( grid ).toHaveClass( 'is-desktop' );
		expect( grid ).toHaveStyle( {
			'--site-redesign-frame-width': '1280',
			'--site-redesign-frame-height': '800',
		} );

		await userEvent.click( screen.getByRole( 'button', { name: 'Preview: Desktop' } ) );
		expect( screen.getByRole( 'menuitemradio', { name: 'Desktop' } ) ).toBeChecked();
		await userEvent.click( screen.getByRole( 'menuitemradio', { name: 'Mobile' } ) );

		expect( screen.queryByRole( 'menu' ) ).toBeNull();
		expect( window.scrollTo ).toHaveBeenCalledTimes( 1 );
		expect( window.scrollTo ).toHaveBeenCalledWith( { top: 0, left: 0, behavior: 'instant' } );
		expect( screen.getByRole( 'button', { name: 'Preview: Mobile' } ) ).toBeVisible();
		expect( grid ).toHaveClass( 'is-mobile' );
		expect( grid ).toHaveStyle( {
			'--site-redesign-frame-width': '390',
			'--site-redesign-frame-height': '844',
		} );
		expect( screen.getByTitle( 'Preview of design 3' ) ).toBe( frame );
		expect( frame ).toHaveClass( 'is-loaded' );
		expect( fetchPreview ).toHaveBeenCalledTimes( 4 );
		expect( screen.getByRole( 'button', { name: 'Design 3 of 4' } ) ).toHaveAttribute(
			'aria-pressed',
			'true'
		);
		expect( screen.getByText( 'Ready to choose' ) ).toBeVisible();
		expect( chooseButton() ).toBeEnabled();
		expect( applyRedesign ).not.toHaveBeenCalled();
	} );

	it( 'previews every design at a tablet viewport too', async () => {
		jest.mocked( fetchRedesign ).mockResolvedValue( session() );
		const { container } = renderPage();

		await selectDesign( 'Design 1 of 4', 'Preview of design 1' );
		const frame = screen.getByTitle( 'Preview of design 1' );
		await userEvent.click( screen.getByRole( 'button', { name: 'Preview: Desktop' } ) );
		expect( screen.getAllByRole( 'menuitemradio' ).map( ( item ) => item.textContent ) ).toEqual( [
			'Desktop',
			'Tablet',
			'Mobile',
		] );
		await userEvent.click( screen.getByRole( 'menuitemradio', { name: 'Tablet' } ) );

		const grid = container.querySelector( '.site-redesign__grid' );
		expect( screen.queryByRole( 'menu' ) ).toBeNull();
		expect( window.scrollTo ).toHaveBeenCalledWith( { top: 0, left: 0, behavior: 'instant' } );
		expect( screen.getByRole( 'button', { name: 'Preview: Tablet' } ) ).toBeVisible();
		expect( grid ).toHaveClass( 'is-tablet' );
		expect( grid ).toHaveStyle( {
			'--site-redesign-frame-width': '768',
			'--site-redesign-frame-height': '1024',
		} );
		expect( screen.getByTitle( 'Preview of design 1' ) ).toBe( frame );
		expect( fetchPreview ).toHaveBeenCalledTimes( 4 );
		expect( chooseButton() ).toBeEnabled();
	} );

	it( 'switches the preview device from the keyboard', async () => {
		jest.mocked( fetchRedesign ).mockResolvedValue( session() );
		const { container } = renderPage();

		( await screen.findByRole( 'button', { name: 'Preview: Desktop' } ) ).focus();
		await userEvent.keyboard( '{ArrowDown}' );
		expect( screen.getByRole( 'button', { name: 'Preview: Desktop' } ) ).toHaveAttribute(
			'aria-expanded',
			'true'
		);
		screen.getByRole( 'menuitemradio', { name: 'Mobile' } ).focus();
		await userEvent.keyboard( '{Enter}' );

		expect( screen.queryByRole( 'menu' ) ).toBeNull();
		expect( container.querySelector( '.site-redesign__grid' ) ).toHaveClass( 'is-mobile' );
		await waitFor( () =>
			expect( screen.getByRole( 'button', { name: 'Preview: Mobile' } ) ).toHaveFocus()
		);
		expect( window.scrollTo ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'closes the device menu without scrolling when the current device is picked again', async () => {
		jest.mocked( fetchRedesign ).mockResolvedValue( session() );
		const { container } = renderPage();

		await userEvent.click( await screen.findByRole( 'button', { name: 'Preview: Desktop' } ) );
		await userEvent.click( screen.getByRole( 'menuitemradio', { name: 'Desktop' } ) );

		expect( screen.queryByRole( 'menu' ) ).toBeNull();
		expect( container.querySelector( '.site-redesign__grid' ) ).toHaveClass( 'is-desktop' );
		expect( window.scrollTo ).not.toHaveBeenCalled();
	} );

	it( 'shows the selected design is being chosen while the request runs', async () => {
		jest.mocked( fetchRedesign ).mockResolvedValue( session() );
		jest.mocked( applyRedesign ).mockReturnValue( new Promise( () => {} ) );
		renderPage();

		await selectDesign( 'Design 1 of 4', 'Preview of design 1' );
		await userEvent.click( chooseButton() );

		expect( await screen.findByText( 'Choosing this design…' ) ).toBeVisible();
		expect( chooseButton() ).toBeDisabled();
		screen
			.getAllByRole( 'button', { name: /^Design \d of 4$/ } )
			.forEach( ( design ) => expect( design ).toBeDisabled() );
		expect( screen.getByText( 'Design 1 of 4', { selector: 'span' } ) ).toBeVisible();
		expect( applyRedesign ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'keeps unfinished candidates from being chosen', async () => {
		jest.mocked( fetchRedesign ).mockResolvedValue(
			session( {
				status: 'generating',
				candidates: [
					candidate( 1 ),
					{ ...candidate( 2 ), status: 'running', routes: null },
					{ ...candidate( 3 ), status: 'queued', routes: null },
					{
						...candidate( 4 ),
						status: 'failed',
						routes: null,
						error: { code: 'x', message: 'This one broke.' },
					},
				],
			} )
		);
		renderPage();

		expect( await screen.findByText( 'This one broke.' ) ).toBeVisible();
		[ 2, 3, 4 ].forEach( ( n ) =>
			expect( screen.getByRole( 'button', { name: `Design ${ n } of 4` } ) ).toBeDisabled()
		);

		await selectDesign( 'Design 1 of 4', 'Preview of design 1' );
		expect( screen.getByRole( 'button', { name: 'Design 1 of 4' } ) ).toHaveAttribute(
			'aria-pressed',
			'true'
		);
		expect( screen.queryByRole( 'button', { name: 'Choose this one' } ) ).toBeNull();
	} );

	it( 'keeps the bar away until every design is made and its preview is on screen', async () => {
		jest.mocked( fetchRedesign ).mockResolvedValue( session() );
		const resolvers: Array< () => void > = [];
		jest.mocked( fetchPreview ).mockImplementation(
			( _site, _id, generationId ) =>
				new Promise( ( resolve ) => {
					resolvers.push( () =>
						resolve( {
							generation_id: generationId,
							path: '/',
							html: '<p>preview</p>',
							routes: [],
						} )
					);
				} )
		);
		const { container } = renderPage();

		await waitFor( () => expect( resolvers ).toHaveLength( 4 ) );
		act( () => resolvers.slice( 0, 3 ).forEach( ( resolve ) => resolve() ) );
		await waitFor( () =>
			expect( container.querySelectorAll( '.site-redesign__frame.is-loaded' ) ).toHaveLength( 3 )
		);
		expect( screen.queryByRole( 'button', { name: 'Choose this one' } ) ).toBeNull();
		expect( container.querySelector( '.step-container-v2__sticky-bottom-bar' ) ).toBeNull();

		act( () => resolvers[ 3 ]() );

		expect( await screen.findByRole( 'button', { name: 'Choose this one' } ) ).toBeDisabled();
		expect( screen.getByText( 'Select a design' ) ).toBeVisible();
	} );

	it( 'brings the bar once the designs there are have loaded, past a failed one', async () => {
		jest.mocked( fetchRedesign ).mockResolvedValue(
			session( {
				candidates: [
					candidate( 1 ),
					candidate( 2 ),
					{
						...candidate( 3 ),
						status: 'failed',
						routes: null,
						error: { code: 'x', message: 'This one broke.' },
					},
				],
			} )
		);
		jest.mocked( fetchPreview ).mockImplementation( ( _site, _id, generationId ) =>
			generationId === candidate( 2 ).id
				? Promise.reject( new Error( 'The preview took too long.' ) )
				: Promise.resolve( {
						generation_id: generationId,
						path: '/',
						html: '<p>preview</p>',
						routes: [],
					} )
		);
		renderPage(
			false,
			REDESIGN_ID,
			new QueryClient( { defaultOptions: { queries: { retry: false } } } )
		);

		expect( await screen.findByRole( 'button', { name: 'Choose this one' } ) ).toBeDisabled();
		expect( screen.getByText( 'This one broke.' ) ).toBeVisible();
		expect( screen.getByText( 'The preview took too long.' ) ).toBeVisible();
		expect( screen.getAllByRole( 'button', { name: /^Design \d of 3$/ } ) ).toHaveLength( 3 );
		expect( screen.getByRole( 'button', { name: 'Design 3 of 3' } ) ).toBeDisabled();
	} );

	it( 'holds four placeholder slots behind a single status while the session opens', () => {
		jest.mocked( openRedesign ).mockReturnValue( new Promise( () => {} ) );
		const { container } = renderPage( false, null );

		expect( screen.getByRole( 'status' ) ).toHaveTextContent( 'Getting your designs ready…' );
		expect(
			container.querySelectorAll( '.site-redesign__thumbnail .site-redesign__skeleton' )
		).toHaveLength( 4 );
		expect( screen.queryByRole( 'button', { name: 'Choose this one' } ) ).toBeNull();
	} );

	it( 'keeps a placeholder over each design until its preview has loaded', async () => {
		jest.mocked( fetchRedesign ).mockResolvedValue(
			session( {
				status: 'generating',
				candidates: [
					candidate( 1 ),
					{ ...candidate( 2 ), status: 'running', routes: null },
					{ ...candidate( 3 ), status: 'queued', routes: null },
					{
						...candidate( 4 ),
						status: 'failed',
						routes: null,
						error: { code: 'x', message: 'This one broke.' },
					},
				],
			} )
		);
		let showPreview = () => {};
		jest.mocked( fetchPreview ).mockReturnValue(
			new Promise( ( resolve ) => {
				showPreview = () =>
					resolve( {
						generation_id: candidate( 1 ).id,
						path: '/',
						html: '<p>preview</p>',
						routes: [],
					} );
			} )
		);
		const { container } = renderPage();
		const skeletons = () => container.querySelectorAll( '.site-redesign__skeleton' );

		expect( await screen.findByText( 'This one broke.' ) ).toBeVisible();
		expect( screen.getByRole( 'status' ) ).toHaveTextContent(
			'Making new designs from your content…'
		);
		expect( skeletons() ).toHaveLength( 3 );
		expect( screen.queryByTitle( 'Preview of design 1' ) ).toBeNull();

		showPreview();

		await waitFor( () =>
			expect( screen.getByTitle( 'Preview of design 1' ) ).toHaveClass( 'is-loaded' )
		);
		expect( skeletons() ).toHaveLength( 2 );
	} );

	it( 'sends the user to checkout with the URL from the 402', async () => {
		jest.mocked( fetchRedesign ).mockResolvedValue( session() );
		jest.mocked( applyRedesign ).mockRejectedValue( {
			code: 'site_redesign_upgrade_required',
			message: 'Upgrade',
			data: { status: 402, checkout_url: CHECKOUT_URL },
		} );
		renderPage();

		await selectDesign( 'Design 2 of 4', 'Preview of design 2' );
		expect( applyRedesign ).not.toHaveBeenCalled();
		await userEvent.click( chooseButton() );

		expect( applyRedesign ).toHaveBeenCalledWith( 1, REDESIGN_ID, candidate( 2 ).id );
		await waitFor( () => expect( page ).toHaveBeenCalledWith( CHECKOUT_URL ) );
		const redirectTo = new URL( CHECKOUT_URL, 'https://wordpress.com' ).searchParams.get(
			'redirect_to'
		);
		expect( redirectTo ).toBe(
			`/site-redesign/example.wordpress.com?redesign=${ REDESIGN_ID }&resume=apply`
		);
	} );

	it( 'refuses a checkout URL that leaves Calypso', async () => {
		jest.mocked( fetchRedesign ).mockResolvedValue( session() );
		jest.mocked( applyRedesign ).mockRejectedValue( {
			code: 'site_redesign_upgrade_required',
			message: 'Upgrade to the Personal plan or higher to use this design.',
			data: { status: 402, checkout_url: 'https://evil.example/checkout/x' },
		} );
		renderPage();

		await selectDesign( 'Design 1 of 4', 'Preview of design 1' );
		await userEvent.click( chooseButton() );

		expect(
			await screen.findByText( 'Upgrade to the Personal plan or higher to use this design.', {
				selector: '.components-notice__content',
			} )
		).toBeVisible();
		expect( page ).not.toHaveBeenCalled();
	} );

	it( 'starts the pending apply once on the checkout return', async () => {
		const pending = candidate( 3 ).id;
		jest.mocked( fetchRedesign ).mockResolvedValue(
			session( {
				pending_apply: pending,
				eligibility: {
					can_preview: true,
					can_apply: true,
					reason: null,
					required_plan: 'personal',
				},
			} )
		);
		jest
			.mocked( applyRedesign )
			.mockResolvedValue(
				session( { status: 'applying', apply: { status: 'queued', error: null } } )
			);
		renderPage( true );

		expect( await screen.findByText( 'Getting your new design ready…' ) ).toBeVisible();
		expect( applyRedesign ).toHaveBeenCalledTimes( 1 );
		expect( applyRedesign ).toHaveBeenCalledWith( 1, REDESIGN_ID, pending );
	} );

	it( 'tries the pending apply only once when it keeps failing', async () => {
		jest.mocked( fetchRedesign ).mockResolvedValue(
			session( {
				pending_apply: candidate( 3 ).id,
				eligibility: {
					can_preview: true,
					can_apply: true,
					reason: null,
					required_plan: 'personal',
				},
			} )
		);
		jest.mocked( applyRedesign ).mockRejectedValue( {
			code: 'site_redesign_not_ready',
			message: 'This design is not ready yet.',
		} );
		renderPage( true );

		expect(
			await screen.findByText( 'This design is not ready yet.', {
				selector: '.components-notice__content',
			} )
		).toBeVisible();
		expect( applyRedesign ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'waits for the purchase instead of offering checkout again', async () => {
		jest
			.mocked( fetchRedesign )
			.mockResolvedValue( session( { pending_apply: candidate( 3 ).id } ) );
		renderPage( true );

		expect( await screen.findByText( 'Finishing your purchase…' ) ).toBeVisible();
		expect( screen.queryByRole( 'button', { name: 'Choose this one' } ) ).toBeNull();
		expect( applyRedesign ).not.toHaveBeenCalled();
	} );

	it( 'allows a full purchase wait after earlier generation polls', async () => {
		jest.useFakeTimers();
		const queryClient = new QueryClient();
		const pending = session( { pending_apply: candidate( 3 ).id } );
		for ( let i = 0; i < 45; i++ ) {
			queryClient.setQueryData( [ 'site-redesign', 1, REDESIGN_ID ], pending );
		}
		jest.mocked( fetchRedesign ).mockResolvedValue( {
			...pending,
			eligibility: { ...pending.eligibility, can_apply: true },
		} );
		jest.mocked( applyRedesign ).mockResolvedValue( session( { status: 'applying' } ) );
		const { unmount } = renderWithProvider(
			<SiteRedesign
				siteId={ 1 }
				siteSlug="example.wordpress.com"
				redesignId={ REDESIGN_ID }
				resume
			/>,
			{ queryClient }
		);
		try {
			expect( screen.getByText( 'Finishing your purchase…' ) ).toBeVisible();
			await act( async () => {
				await jest.advanceTimersByTimeAsync( 3100 );
			} );
			expect( fetchRedesign ).toHaveBeenCalled();
			expect( applyRedesign ).toHaveBeenCalledWith( 1, REDESIGN_ID, candidate( 3 ).id );
		} finally {
			unmount();
			queryClient.clear();
			jest.useRealTimers();
		}
	} );

	it( 'ends the purchase wait after two minutes', async () => {
		jest.useFakeTimers();
		jest
			.mocked( fetchRedesign )
			.mockResolvedValue( session( { pending_apply: candidate( 3 ).id } ) );
		const { unmount } = renderPage( true );
		try {
			await act( async () => {
				await jest.advanceTimersByTimeAsync( 100 );
			} );
			expect( screen.getByText( 'Finishing your purchase…' ) ).toBeVisible();
			await act( async () => {
				await jest.advanceTimersByTimeAsync( 120000 );
			} );
			expect( screen.getByText( /Your purchase is taking longer than usual/ ) ).toBeVisible();
			const calls = jest.mocked( fetchRedesign ).mock.calls.length;
			await act( async () => {
				await jest.advanceTimersByTimeAsync( 6000 );
			} );
			expect( fetchRedesign ).toHaveBeenCalledTimes( calls );
		} finally {
			unmount();
			jest.useRealTimers();
		}
	} );

	it( 'polls when the purchase listener started the apply first', async () => {
		const pending = candidate( 3 ).id;
		jest
			.mocked( fetchRedesign )
			.mockResolvedValueOnce(
				session( {
					pending_apply: pending,
					eligibility: {
						can_preview: true,
						can_apply: true,
						reason: null,
						required_plan: 'personal',
					},
				} )
			)
			.mockResolvedValue(
				session( { status: 'applying', apply: { status: 'delivering', error: null } } )
			);
		jest.mocked( applyRedesign ).mockRejectedValue( {
			code: 'site_redesign_busy',
			message: 'This redesign is busy.',
		} );
		renderPage( true );

		expect( await screen.findByText( 'Installing your new design…' ) ).toBeVisible();
		expect( screen.queryByText( 'This redesign is busy.' ) ).toBeNull();
	} );

	it( 'shows the install as a full-page loading state with one status', async () => {
		jest
			.mocked( fetchRedesign )
			.mockResolvedValue(
				session( { status: 'applying', apply: { status: 'awaiting_atomic', error: null } } )
			);
		renderPage();

		await screen.findByText( 'Preparing your site. This can take a few minutes.' );
		expect( screen.getAllByRole( 'status' ) ).toHaveLength( 1 );
		expect( screen.getByRole( 'status' ) ).toHaveTextContent(
			'Preparing your site. This can take a few minutes.'
		);
		expect( screen.getByRole( 'progressbar' ) ).not.toHaveAttribute( 'value' );
		expect( screen.queryByText( 'Redesign your site' ) ).toBeNull();
		expect(
			screen.queryByText( 'Pick a new design made from the content already on your site.' )
		).toBeNull();
		expect( screen.queryByRole( 'button', { name: 'Choose this one' } ) ).toBeNull();
	} );

	const installed = ( overrides: Partial< Redesign > = {} ) =>
		session( {
			status: 'installed',
			selected: candidate( 2 ).id,
			apply: { status: 'installed', error: null },
			applied: {
				mode: 'installed',
				preview_url:
					'https://example.wordpress.com/wp-admin/site-editor.php?wp_theme_preview=pub/new&wpcom_dashboard_link=%2Fsite-redesign',
				can_rollback: true,
			},
			...overrides,
		} );

	it( 'reviews the installed theme on the site itself before it goes live', async () => {
		jest.mocked( fetchRedesign ).mockResolvedValue( installed() );
		const { container } = renderPage( true );

		const frame = await screen.findByTitle( 'Preview of your new design' );
		expect( frame ).toHaveAttribute(
			'src',
			'https://example.wordpress.com/?wp_theme_preview=pub%2Fnew'
		);
		expect( screen.getByRole( 'heading', { name: 'Your new design is ready' } ) ).toBeVisible();
		expect(
			screen.getByText(
				'Switch to it when you’re ready. Your site keeps its current design until then.'
			)
		).toBeVisible();
		expect( screen.queryByRole( 'link', { name: 'Preview' } ) ).toBeNull();
		expect( screen.getByText( 'Your chosen design' ) ).toBeVisible();
		expect( screen.queryByText( 'Design 2 of 4' ) ).toBeNull();
		const open = screen.getByRole( 'link', { name: 'Open preview in a new tab' } );
		expect( open ).toHaveAttribute(
			'href',
			'https://example.wordpress.com/?wp_theme_preview=pub%2Fnew'
		);
		expect( open ).toHaveAttribute( 'target', '_blank' );
		expect( open ).toHaveAttribute( 'rel', 'noopener noreferrer' );
		expect( screen.queryByText( 'Open the preview in a new tab' ) ).toBeNull();
		const controls = [
			open,
			screen.getByRole( 'button', { name: 'Preview: Desktop' } ),
			screen.getByRole( 'button', { name: 'Use this design' } ),
		];
		controls
			.slice( 1 )
			.forEach( ( control, index ) =>
				expect(
					controls[ index ].compareDocumentPosition( control ) & Node.DOCUMENT_POSITION_FOLLOWING
				).toBeTruthy()
			);
		expect( screen.getByText( 'Installed, not yet live' ) ).toBeVisible();
		expect( screen.getAllByRole( 'button', { name: 'Use this design' } ) ).toHaveLength( 1 );
		expect( screen.getByRole( 'button', { name: 'Use this design' } ) ).toBeEnabled();
		expect( activateRedesign ).not.toHaveBeenCalled();
		expect( applyRedesign ).not.toHaveBeenCalled();

		await userEvent.click( screen.getByRole( 'button', { name: 'Preview: Desktop' } ) );
		await userEvent.click( screen.getByRole( 'menuitemradio', { name: 'Mobile' } ) );
		expect( container.querySelector( '.site-redesign__installed-frame' ) ).toHaveStyle( {
			'--site-redesign-frame-width': '390',
			'--site-redesign-frame-height': '844',
		} );
		expect( screen.getByTitle( 'Preview of your new design' ) ).toBe( frame );
	} );

	it( 'says so when the installed theme has no preview to show', async () => {
		jest.mocked( fetchRedesign ).mockResolvedValue(
			installed( {
				applied: {
					mode: 'installed',
					preview_url: 'https://example.wordpress.com/wp-admin/site-editor.php',
					can_rollback: true,
				},
			} )
		);
		renderPage();

		expect(
			await screen.findByText(
				'The preview isn’t available right now. You can still switch to your new design.'
			)
		).toBeVisible();
		expect( screen.queryByTitle( 'Preview of your new design' ) ).toBeNull();
		expect( screen.queryByRole( 'link', { name: 'Open preview in a new tab' } ) ).toBeNull();
		expect( screen.getByRole( 'button', { name: 'Use this design' } ) ).toBeEnabled();
	} );

	it( 'takes the site to its theme list once the new design is live', async () => {
		jest.mocked( fetchRedesign ).mockResolvedValue( installed() );
		let finish: ( value: Redesign ) => void = () => {};
		jest.mocked( activateRedesign ).mockReturnValue(
			new Promise( ( resolve ) => {
				finish = resolve;
			} )
		);
		renderPage();

		await userEvent.click( await screen.findByRole( 'button', { name: 'Use this design' } ) );

		expect( screen.getByRole( 'button', { name: 'Use this design' } ) ).toBeDisabled();
		expect( screen.getByText( 'Switching your site to the new design…' ) ).toBeVisible();
		act( () =>
			finish(
				session( {
					status: 'applied',
					apply: { status: 'succeeded', error: null },
					applied: {
						mode: 'activated',
						preview_url: 'https://example.wordpress.com/',
						can_rollback: true,
					},
				} )
			)
		);
		await waitFor( () =>
			expect( page.replace ).toHaveBeenCalledWith( '/themes/example.wordpress.com' )
		);
		expect( page.replace ).toHaveBeenCalledTimes( 1 );
		expect( activateRedesign ).toHaveBeenCalledTimes( 1 );
		expect( screen.queryByText( 'Your site has its new design' ) ).toBeNull();
		expect( screen.queryByRole( 'link', { name: 'View site' } ) ).toBeNull();
	} );

	it( 'goes straight to the theme list when the redesign is already live', async () => {
		jest
			.mocked( fetchRedesign )
			.mockResolvedValue(
				session( { status: 'applied', apply: { status: 'succeeded', error: null } } )
			);
		renderPage();

		await waitFor( () =>
			expect( page.replace ).toHaveBeenCalledWith( '/themes/example.wordpress.com' )
		);
		expect( page.replace ).toHaveBeenCalledTimes( 1 );
		expect( activateRedesign ).not.toHaveBeenCalled();
	} );

	it( 'keeps the review open and the action retryable when switching fails', async () => {
		jest.mocked( fetchRedesign ).mockResolvedValue( installed() );
		jest
			.mocked( activateRedesign )
			.mockRejectedValueOnce( new Error( 'We couldn’t switch the theme.' ) );
		renderPage();

		await userEvent.click( await screen.findByRole( 'button', { name: 'Use this design' } ) );

		expect(
			await screen.findByText( 'We couldn’t switch the theme.', {
				selector: '.components-notice__content',
			} )
		).toBeVisible();
		expect( screen.getByTitle( 'Preview of your new design' ) ).toBeVisible();
		expect( screen.getByText( 'Installed, not yet live' ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Use this design' } ) ).toBeEnabled();
		expect( page.replace ).not.toHaveBeenCalled();
	} );

	it( 'shows the rollback message when the switch failed', async () => {
		jest.mocked( fetchRedesign ).mockResolvedValue(
			session( {
				status: 'installed',
				apply: {
					status: 'installed',
					error: { code: 'site_redesign_theme_does_not_load', message: 'The site did not load.' },
				},
				applied: {
					mode: 'installed',
					preview_url: 'https://example.wordpress.com/wp-admin/site-editor.php',
					can_rollback: true,
				},
			} )
		);
		renderPage();

		expect(
			await screen.findByText( /kept its current one\. The site did not load\./, {
				selector: '.components-notice__content',
			} )
		).toBeVisible();
	} );
} );

describe( 'installedPreviewUrl', () => {
	it( 'opens the Site Editor preview on the site’s home instead', () => {
		expect(
			installedPreviewUrl(
				'https://example.wordpress.com/wp-admin/site-editor.php?wp_theme_preview=pub/new&wpcom_dashboard_link=%2Fsite-redesign%2Fexample'
			)
		).toBe( 'https://example.wordpress.com/?wp_theme_preview=pub%2Fnew' );
	} );

	it( 'keeps a site in a subdirectory and an encoded theme', () => {
		expect(
			installedPreviewUrl(
				'https://example.com/blog/wp-admin/site-editor.php?wp_theme_preview=premium%2Fnew-theme'
			)
		).toBe( 'https://example.com/blog/?wp_theme_preview=premium%2Fnew-theme' );
	} );

	it( 'shows nothing rather than the active theme when the theme is missing', () => {
		expect(
			installedPreviewUrl( 'https://example.wordpress.com/wp-admin/site-editor.php' )
		).toBeUndefined();
		expect(
			installedPreviewUrl(
				'https://example.wordpress.com/wp-admin/site-editor.php?wp_theme_preview='
			)
		).toBeUndefined();
	} );

	it( 'keeps any other preview address as it is, and refuses non-web ones', () => {
		expect( installedPreviewUrl( 'https://example.wordpress.com/?preview=1' ) ).toBe(
			'https://example.wordpress.com/?preview=1'
		);
		expect( installedPreviewUrl( 'javascript:alert(1)' ) ).toBeUndefined();
		expect( installedPreviewUrl( undefined ) ).toBeUndefined();
	} );
} );
