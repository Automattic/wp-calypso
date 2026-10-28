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
import SiteRedesign from '../main';

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

const renderPage = ( resume = false, redesignId: string | null = REDESIGN_ID ) =>
	renderWithProvider(
		<SiteRedesign
			siteId={ 1 }
			siteSlug="example.wordpress.com"
			redesignId={ redesignId }
			resume={ resume }
		/>
	);

describe( 'SiteRedesign', () => {
	beforeEach( () => {
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

		expect( await screen.findByText( 'Making four designs from your content…' ) ).toBeVisible();
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
		expect( await screen.findByText( 'Making four designs from your content…' ) ).toBeVisible();
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
		expect( await screen.findByText( 'Making four designs from your content…' ) ).toBeVisible();
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
		expect( screen.getAllByRole( 'button', { name: /Choose design/ } ) ).toHaveLength( 4 );
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
		screen
			.getAllByRole( 'button', { name: /Choose design/ } )
			.forEach( ( button ) => expect( button ).toBeDisabled() );
	} );

	it( 'sends the user to checkout with the URL from the 402', async () => {
		jest.mocked( fetchRedesign ).mockResolvedValue( session() );
		jest.mocked( applyRedesign ).mockRejectedValue( {
			code: 'site_redesign_upgrade_required',
			message: 'Upgrade',
			data: { status: 402, checkout_url: CHECKOUT_URL },
		} );
		renderPage();

		const [ , second ] = await screen.findAllByRole( 'button', { name: /Choose design/ } );
		await userEvent.click( second );

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

		const [ first ] = await screen.findAllByRole( 'button', { name: /Choose design/ } );
		await userEvent.click( first );

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
		expect( screen.queryByRole( 'button', { name: /Choose design/ } ) ).toBeNull();
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

	it( 'offers the Live Preview from the API once the theme is installed', async () => {
		const previewUrl =
			'https://example.wordpress.com/wp-admin/site-editor.php?wp_theme_preview=pub/new';
		jest.mocked( fetchRedesign ).mockResolvedValue(
			session( {
				status: 'installed',
				apply: { status: 'installed', error: null },
				applied: { mode: 'installed', preview_url: previewUrl, can_rollback: true },
			} )
		);
		renderPage( true );

		expect( await screen.findByRole( 'link', { name: 'Preview' } ) ).toHaveAttribute(
			'href',
			previewUrl
		);
		expect( screen.getByRole( 'button', { name: 'Use this design' } ) ).toBeEnabled();
		expect( applyRedesign ).not.toHaveBeenCalled();
	} );

	it( 'activates the installed design from "Use this design"', async () => {
		jest.mocked( fetchRedesign ).mockResolvedValue(
			session( {
				status: 'installed',
				apply: { status: 'installed', error: null },
				applied: {
					mode: 'installed',
					preview_url: 'https://example.wordpress.com/wp-admin/site-editor.php',
					can_rollback: true,
				},
			} )
		);
		jest.mocked( activateRedesign ).mockResolvedValue(
			session( {
				status: 'applied',
				apply: { status: 'succeeded', error: null },
				applied: {
					mode: 'activated',
					preview_url: 'https://example.wordpress.com/',
					can_rollback: true,
				},
			} )
		);
		renderPage();

		await userEvent.click( await screen.findByRole( 'button', { name: 'Use this design' } ) );

		expect( activateRedesign ).toHaveBeenCalledWith( 1, REDESIGN_ID );
		expect( await screen.findByRole( 'link', { name: 'View site' } ) ).toHaveAttribute(
			'href',
			'https://example.wordpress.com/'
		);
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
