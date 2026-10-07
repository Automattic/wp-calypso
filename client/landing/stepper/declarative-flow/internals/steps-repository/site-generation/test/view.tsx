/**
 * @jest-environment jsdom
 */

import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { initialStreamState } from '../stream/reducer';
import { SiteGenerationView, TINT_HOLD_MS } from '../view';
import type { BuildWowStreamView } from '../stream/use-build-wow-stream';
import type { SiteGenerationState, SiteGenerationStep } from '../use-site-generation';

jest.mock( 'i18n-calypso', () => ( {
	localize: ( Component: unknown ) => Component,
	useTranslate: () => ( text: string, options?: { args?: Record< string, string | number > } ) =>
		Object.entries( options?.args ?? {} ).reduce(
			( translated, [ key, value ] ) =>
				translated
					.replace( `%(${ key })s`, String( value ) )
					.replace( `%(${ key })d`, String( value ) ),
			text
		),
} ) );

const idleState = {
	retryBuild: null,
	isRetryingBuild: false,
};

const progressStream: BuildWowStreamView = {
	info: {
		protocol: 1,
		blogId: 123,
		runId: 'run-1',
		graph: 'dsl',
		capabilities: [ 'progress' ],
		eventsUrl: 'https://example.com/events',
		snapshotUrl: 'https://example.com/snapshot',
	},
	state: {
		...initialStreamState( 'run-1' ),
		phases: { prepare: 1 },
		currentStep: 'Validate the exported DSL theme',
	},
};

function fireTransitionEnd( element: HTMLElement, propertyName: string ) {
	const event = new Event( 'transitionend', { bubbles: true } );
	Object.defineProperty( event, 'propertyName', { value: propertyName } );
	fireEvent( element, event );
}

describe( 'SiteGenerationView progress and fallback states', () => {
	it( 'uses live graph progress for an opted-in build and keeps the synthetic preview out', () => {
		const { container } = render(
			<SiteGenerationView
				onReload={ jest.fn() }
				state={ { ...idleState, status: 'working', steps: [] } }
				stream={ progressStream }
			/>
		);

		expect( screen.getByRole( 'region', { name: 'Live site build' } ) ).toBeVisible();
		expect( screen.getByRole( 'heading', { name: 'Your site is taking shape' } ) ).toBeVisible();
		expect( screen.getAllByText( 'Validate the exported DSL theme' ).length ).toBeGreaterThan( 0 );
		expect( container.querySelector( '.site-generation__page-preview' ) ).toBeNull();
		expect( screen.queryByText( 'Colors' ) ).not.toBeInTheDocument();
	} );

	it( 'keeps the existing synthetic preview when there is no active stream', () => {
		const { container } = render(
			<SiteGenerationView
				onReload={ jest.fn() }
				state={ { ...idleState, status: 'working', steps: [] } }
			/>
		);

		expect( container.querySelector( '.site-generation__page-preview' ) ).toBeInTheDocument();
		expect( screen.queryByRole( 'region', { name: 'Live site build' } ) ).not.toBeInTheDocument();
	} );

	it( 'uses the live canvas empty state immediately when streaming is opted in', () => {
		const { container } = render(
			<SiteGenerationView
				onReload={ jest.fn() }
				state={ { ...idleState, status: 'working', steps: [] } }
				streamRequested
			/>
		);

		expect( screen.getByRole( 'region', { name: 'Live site build' } ) ).toBeVisible();
		expect( screen.getByText( 'Your idea, taking shape' ) ).toBeVisible();
		expect( container.querySelector( '.site-generation-live__cards' ) ).toBeNull();
		expect( container.querySelector( '.site-generation-live__dashes' ) ).toBeNull();
		expect( container.querySelector( '.site-generation__page-preview' ) ).toBeNull();
	} );

	it( 'paginates the outline and previews ready image assets', async () => {
		const stream: BuildWowStreamView = {
			...progressStream,
			info: {
				...progressStream.info,
				capabilities: [ 'progress', 'planning', 'design', 'sections', 'images' ],
			},
			state: {
				...progressStream.state,
				plan: {
					status: 'completed',
					title: 'A garden for everyone',
					direction: 'Quiet and welcoming',
					palette: null,
					typography: null,
					images: [ { query: 'A sunlit garden path', aspectRatio: null } ],
					pages: [
						{ slug: 'home', title: 'Home', sections: [ 'Welcome' ] },
						{ slug: 'about', title: 'About', sections: [ 'Our story' ] },
					],
				},
				images: {
					'hero-image.png': {
						status: 'ready',
						url: '/wp-content/themes/demo/assets/hero-image.png?v=abc12345',
						query: 'A sunlit garden path',
						aspectRatio: '16:9',
					},
				},
			},
		};

		render(
			<SiteGenerationView
				onReload={ jest.fn() }
				siteSlug="example.wpcomstaging.com"
				state={ { ...idleState, status: 'working', steps: [] } }
				stream={ stream }
			/>
		);

		const liveCanvasElement = screen.getByRole( 'region', { name: 'Live site build' } );
		const liveCanvas = within( liveCanvasElement );
		expect( liveCanvas.getByText( 'Welcome' ) ).toBeVisible();
		expect( liveCanvas.queryByText( 'Our story' ) ).not.toBeInTheDocument();
		expect( liveCanvas.getByText( '1 of 1 images ready' ) ).toBeVisible();
		expect( liveCanvasElement.querySelectorAll( '.site-generation-live__slot' ) ).toHaveLength( 1 );
		const image = liveCanvas.getByRole( 'img', { name: 'A sunlit garden path' } );
		expect( image ).toHaveAttribute(
			'src',
			'https://example.wpcomstaging.com/wp-content/themes/demo/assets/hero-image.png?v=abc12345'
		);
		expect( image.parentElement ).toHaveAttribute( 'data-loaded', 'false' );
		fireEvent.load( image );
		expect( image.parentElement ).toHaveAttribute( 'data-loaded', 'true' );

		await userEvent.click( liveCanvas.getByRole( 'tab', { name: 'About' } ) );
		expect( liveCanvas.getByText( 'Our story' ) ).toBeVisible();
		expect( liveCanvas.queryByText( 'Welcome' ) ).not.toBeInTheDocument();
	} );

	it( 'explains missing previews when the host sends only image lifecycle data', () => {
		render(
			<SiteGenerationView
				onReload={ jest.fn() }
				siteSlug="example.wpcomstaging.com"
				state={ { ...idleState, status: 'working', steps: [] } }
				stream={ {
					...progressStream,
					state: {
						...progressStream.state,
						images: {
							hero: { status: 'ready', url: null, query: 'A garden path', aspectRatio: null },
						},
					},
				} }
			/>
		);

		expect( screen.queryByRole( 'img', { name: 'A garden path' } ) ).not.toBeInTheDocument();
		expect(
			screen.getByText( 'Images are ready. Previews aren’t available for this build.' )
		).toBeVisible();
	} );

	it( 'shows planned image slots before the image lifecycle events arrive', () => {
		const stream: BuildWowStreamView = {
			...progressStream,
			info: { ...progressStream.info, capabilities: [ 'progress', 'planning' ] },
			state: {
				...progressStream.state,
				plan: {
					status: 'developing',
					title: 'A garden for everyone',
					direction: 'Quiet and welcoming',
					palette: null,
					typography: null,
					pages: null,
					images: [
						{ query: 'A sunlit garden path', aspectRatio: '16:9' },
						{ query: 'A hand-painted garden sign', aspectRatio: '1:1' },
					],
				},
			},
		};

		const { container } = render(
			<SiteGenerationView
				onReload={ jest.fn() }
				state={ { ...idleState, status: 'working', steps: [] } }
				stream={ stream }
			/>
		);

		const liveCanvas = within( screen.getByRole( 'region', { name: 'Live site build' } ) );
		expect( liveCanvas.getByText( '0 of 2 images ready' ) ).toBeVisible();
		expect( liveCanvas.getByText( 'A sunlit garden path' ) ).toBeVisible();
		expect( liveCanvas.getByText( 'A hand-painted garden sign' ) ).toBeVisible();
		expect( container.querySelectorAll( '.site-generation-live__slot' ) ).toHaveLength( 2 );
		expect(
			container.querySelectorAll( '.site-generation-live__slot-mark[data-status="pending"]' )
		).toHaveLength( 2 );
	} );

	it( 'keeps failed image URLs graceful and hides opaque asset filenames', () => {
		const stream: BuildWowStreamView = {
			...progressStream,
			state: {
				...progressStream.state,
				images: {
					'26c513d4220b060ad-efa.png': {
						status: 'ready',
						url: '/wp-content/themes/demo/assets/26c513d4220b060ad-efa.png',
						query: null,
						aspectRatio: '16:9',
					},
				},
			},
		};

		const { container } = render(
			<SiteGenerationView
				onReload={ jest.fn() }
				siteSlug="example.wpcomstaging.com"
				state={ { ...idleState, status: 'working', steps: [] } }
				stream={ stream }
			/>
		);

		const image = screen.getByRole( 'img', { name: 'Site image' } );
		expect( screen.getByText( 'Site image' ) ).toBeVisible();
		fireEvent.error( image );
		expect( container.querySelector( '.site-generation-live__slot img' ) ).toBeNull();
		expect(
			container.querySelector( '.site-generation-live__slot-mark[data-status="ready"]' )
		).toBeInTheDocument();
	} );

	it( 'reveals design and page details only when the graph advertises those capabilities', () => {
		const stream: BuildWowStreamView = {
			...progressStream,
			info: {
				...progressStream.info,
				capabilities: [ 'progress', 'planning', 'design', 'sections', 'images' ],
			},
			state: {
				...progressStream.state,
				directions: [ 'Garden journal' ],
				images: {
					hero: {
						status: 'ready',
						url: '/wp-content/themes/example/assets/hero.jpg',
						query: 'Hero photograph',
						aspectRatio: '16:9',
					},
					visit: { status: 'generating', url: null, query: 'Garden path', aspectRatio: null },
				},
				sections: {
					home: { 0: { kind: 'content', name: 'A place to pause', partial: true } },
				},
				plan: {
					status: 'developing',
					title: 'A garden for everyone',
					direction: 'Quiet and welcoming',
					palette: [ { name: 'Accent', color: '#176B45' } ],
					typography: [
						{ name: 'Source Serif 4', family: '"Source Serif 4", serif', role: 'heading' },
						{ name: 'DM Sans', family: "'DM Sans', sans-serif", role: 'body' },
					],
					pages: [ { slug: 'home', title: 'Home', sections: [ 'Welcome', 'Visit' ] } ],
					images: null,
				},
			},
		};

		render(
			<SiteGenerationView
				onReload={ jest.fn() }
				state={ { ...idleState, status: 'working', steps: [] } }
				stream={ stream }
			/>
		);

		const liveCanvas = within( screen.getByRole( 'region', { name: 'Live site build' } ) );
		expect( liveCanvas.getByRole( 'heading', { name: 'A garden for everyone' } ) ).toBeVisible();
		expect( liveCanvas.getByText( 'Quiet and welcoming' ) ).toBeVisible();
		expect( liveCanvas.getByText( 'Garden journal' ) ).toBeVisible();
		expect( liveCanvas.getByLabelText( 'Accent, #176B45' ) ).toBeVisible();
		expect( document.querySelector( '.site-generation-live' ) ).toHaveStyle( {
			'--live-site-accent': '#176B45',
		} );
		const fontStylesheets = document.head.querySelectorAll(
			'link[href^="https://fonts-api.wp.com/css2?"]'
		);
		expect( fontStylesheets ).toHaveLength( 2 );
		expect( fontStylesheets[ 0 ] ).toHaveAttribute(
			'href',
			expect.stringContaining( 'Source+Serif+4' )
		);
		expect( fontStylesheets[ 1 ] ).toHaveAttribute( 'href', expect.stringContaining( 'DM+Sans' ) );
		expect( liveCanvas.getByText( 'Source Serif 4' ) ).toBeVisible();
		expect( liveCanvas.getByRole( 'heading', { name: 'A garden for everyone' } ) ).toHaveStyle( {
			fontFamily: '"Source Serif 4", serif, var(--live-serif)',
		} );
		expect( liveCanvas.getByText( 'Welcome' ) ).toBeVisible();
		expect( liveCanvas.getByText( 'Visit' ) ).toBeVisible();
		expect(
			document.querySelector( '.site-generation-live__slot-mark[data-status="generating"]' )
		).toBeInTheDocument();
		expect( liveCanvas.getByText( 'A place to pause' ) ).toBeVisible();
		expect( liveCanvas.getByText( 'In progress' ) ).toBeVisible();
		expect( liveCanvas.getByText( '1 of 2 images ready' ) ).toBeVisible();

		const sidebar = screen.getByRole( 'complementary', { name: 'Site generation progress' } );
		expect( within( sidebar ).queryByText( 'A garden for everyone' ) ).not.toBeInTheDocument();
		expect( within( sidebar ).queryByText( 'Quiet and welcoming' ) ).not.toBeInTheDocument();
		expect( within( sidebar ).queryByText( 'Leaf, #176B45' ) ).not.toBeInTheDocument();
		expect(
			within( sidebar ).getByText(
				'Hello! I’m the WordPress Agent, and I’m building your site right now.'
			)
		).toBeVisible();
	} );

	it( 'shows structured Engine data when an older host advertises progress only', () => {
		const stream: BuildWowStreamView = {
			...progressStream,
			state: {
				...progressStream.state,
				currentStep: null,
				plan: {
					status: 'completed',
					title: 'Goat Moat',
					direction: 'Playful editorial layouts',
					palette: [ { name: 'Berry', color: '#B91D60' } ],
					typography: [ { name: 'Fredoka', family: 'Fredoka', role: 'heading' } ],
					pages: [ { slug: 'home', title: 'Home', sections: [ 'Welcome', 'Animal preview' ] } ],
					images: null,
				},
				images: {
					hero: {
						status: 'ready',
						url: '/wp-content/themes/example/assets/hero.jpg',
						query: 'Hero photograph',
						aspectRatio: '16:9',
					},
					goat: { status: 'generating', url: null, query: 'Goat portrait', aspectRatio: '1:1' },
				},
			},
		};

		render(
			<SiteGenerationView
				onReload={ jest.fn() }
				state={ {
					...idleState,
					status: 'working',
					steps: [ { id: 'polish', label: 'Polishing your site', status: 'active' } ],
				} }
				stream={ stream }
			/>
		);

		const liveCanvas = within( screen.getByRole( 'region', { name: 'Live site build' } ) );
		expect( liveCanvas.getByRole( 'heading', { name: 'Goat Moat' } ) ).toBeVisible();
		expect( liveCanvas.getByText( 'Playful editorial layouts' ) ).toBeVisible();
		expect( liveCanvas.getByLabelText( 'Berry, #B91D60' ) ).toBeVisible();
		expect( liveCanvas.getByText( 'Fredoka' ) ).toBeVisible();
		expect( liveCanvas.getByText( 'Welcome' ) ).toBeVisible();
		expect( liveCanvas.getByText( 'Animal preview' ) ).toBeVisible();
		expect( liveCanvas.queryByText( 'In progress' ) ).not.toBeInTheDocument();
		expect( liveCanvas.getByText( '1 of 2 images ready' ) ).toBeVisible();
		expect( liveCanvas.getByText( 'Polishing your site' ) ).toBeVisible();
	} );

	it( 'clears the brief when a retry drops the previous plan and sections', () => {
		const stream: BuildWowStreamView = {
			...progressStream,
			info: {
				...progressStream.info,
				capabilities: [ 'progress', 'planning', 'design', 'sections' ],
			},
			state: {
				...progressStream.state,
				plan: {
					status: 'developing',
					title: 'A garden for everyone',
					direction: 'Quiet and welcoming',
					palette: [ { name: 'Leaf', color: '#176B45' } ],
					typography: null,
					pages: [ { slug: 'home', title: 'Home', sections: [ 'Welcome' ] } ],
					images: null,
				},
				sections: {
					home: { 0: { kind: 'content', name: 'Welcome', partial: false } },
				},
			},
		};
		const { rerender } = render(
			<SiteGenerationView
				onReload={ jest.fn() }
				state={ { ...idleState, status: 'working', steps: [] } }
				stream={ stream }
			/>
		);

		expect( screen.getByRole( 'heading', { name: 'A garden for everyone' } ) ).toBeVisible();
		expect( screen.getByLabelText( 'Leaf, #176B45' ) ).toBeVisible();
		expect( screen.getByText( 'Welcome' ) ).toBeVisible();

		rerender(
			<SiteGenerationView
				onReload={ jest.fn() }
				state={ { ...idleState, status: 'working', steps: [] } }
				stream={ progressStream }
			/>
		);

		expect( screen.getByRole( 'heading', { name: 'Your site is taking shape' } ) ).toBeVisible();
		expect( screen.queryByText( 'A garden for everyone' ) ).not.toBeInTheDocument();
		expect( screen.queryByText( 'Quiet and welcoming' ) ).not.toBeInTheDocument();
		expect( screen.queryByText( 'Welcome' ) ).not.toBeInTheDocument();
		expect( screen.queryByLabelText( 'Leaf, #176B45' ) ).not.toBeInTheDocument();
	} );

	it( 'shows an accessible elapsed time for the active step and updates it every second', () => {
		jest.useFakeTimers();
		jest.setSystemTime( new Date( '2026-08-07T12:00:00Z' ) );

		try {
			const { getByText, rerender } = render(
				<SiteGenerationView
					onReload={ jest.fn() }
					state={ {
						...idleState,
						status: 'working',
						steps: [
							{
								id: 'preparing',
								label: 'Preparing the site',
								status: 'active',
								startedAt: Date.now() - 12000,
							},
						],
					} }
				/>
			);

			expect( getByText( '12s' ) ).toHaveAttribute( 'aria-label', 'Elapsed time: 12s' );
			expect( getByText( '12s' ) ).toHaveAttribute( 'aria-live', 'off' );

			rerender(
				<SiteGenerationView
					onReload={ jest.fn() }
					state={ {
						...idleState,
						status: 'working',
						steps: [
							{
								id: 'preparing',
								label: 'Preparing the site',
								status: 'active',
								startedAt: Date.now() - 192000,
							},
						],
					} }
				/>
			);

			expect( getByText( '3m 12s' ) ).toBeVisible();

			act( () => jest.advanceTimersByTime( 1000 ) );

			expect( getByText( '3m 13s' ) ).toBeVisible();
		} finally {
			jest.useRealTimers();
		}
	} );

	it( 'uses the calm reload fallback for failed builds and timeouts', () => {
		const onReload = jest.fn();
		const { getByRole, getByText, rerender } = render(
			<SiteGenerationView
				onReload={ onReload }
				state={ {
					...idleState,
					status: 'failed',
					failureReason: 'build-failed',
					steps: [ { id: 'preparing', label: 'Preparing the site', status: 'active' } ],
				} }
			/>
		);

		expect( getByRole( 'heading', { name: 'This is taking longer than expected' } ) ).toBeVisible();
		expect( getByText( 'Your brief is saved.' ) ).toBeVisible();
		expect( getByRole( 'button', { name: 'Check again' } ) ).toBeVisible();

		rerender(
			<SiteGenerationView
				onReload={ onReload }
				state={ {
					...idleState,
					status: 'failed',
					failureReason: 'timed-out',
					steps: [ { id: 'preparing', label: 'Preparing the site', status: 'active' } ],
				} }
			/>
		);

		expect( getByRole( 'heading', { name: 'This is taking longer than expected' } ) ).toBeVisible();
		expect( getByRole( 'button', { name: 'Check again' } ) ).toBeVisible();
	} );

	it( 'announces the active step, since the step list itself never changes text', () => {
		const labels = [ 'Preparing the site', 'Choosing the design', 'Building the pages' ];
		const steps = ( activeIndex: number ) =>
			labels.map( ( label, index ) => {
				let status: SiteGenerationStep[ 'status' ] = 'idle';
				if ( index < activeIndex ) {
					status = 'done';
				} else if ( index === activeIndex ) {
					status = 'active';
				}
				return { id: `step-${ index }`, label, status };
			} );

		const { getAllByRole, getByRole, rerender } = render(
			<SiteGenerationView
				onReload={ jest.fn() }
				state={ { ...idleState, status: 'working', steps: steps( 0 ) } }
			/>
		);

		expect( getByRole( 'status' ) ).toHaveTextContent( 'Preparing the site' );

		rerender(
			<SiteGenerationView
				onReload={ jest.fn() }
				state={ { ...idleState, status: 'working', steps: steps( 2 ) } }
			/>
		);

		expect( getByRole( 'status' ) ).toHaveTextContent( 'Building the pages' );

		rerender(
			<SiteGenerationView
				onReload={ jest.fn() }
				state={ {
					...idleState,
					status: 'failed',
					failureReason: 'build-failed',
					steps: steps( 2 ),
				} }
			/>
		);

		expect(
			getAllByRole( 'status' ).some( ( region ) =>
				region.textContent?.includes( 'Building the pages' )
			)
		).toBe( false );
	} );
} );

const failedState: SiteGenerationState = {
	status: 'failed',
	failureReason: 'build-failed',
	failureLabel: 'We couldn’t finish building your site',
	failureDetail: 'You can start the build again right away.',
	steps: [],
	retryBuild: jest.fn(),
	isRetryingBuild: false,
};

describe( 'SiteGenerationView wait estimate', () => {
	const workingState: SiteGenerationState = {
		...idleState,
		status: 'working',
		steps: [ { id: 'prepare', label: 'Preparing your site', status: 'active' } ],
	};

	it( 'promises up to 4 minutes on the DSL graph', () => {
		render( <SiteGenerationView graph="dsl" onReload={ jest.fn() } state={ workingState } /> );

		expect( screen.getByText( /This can take up to 4 minutes\./ ) ).toBeInTheDocument();
	} );

	it.each( [ 'blocks-first' as const, undefined ] )(
		'promises up to 10 minutes when the graph is %s',
		( graph ) => {
			render(
				<SiteGenerationView graph={ graph } onReload={ jest.fn() } state={ workingState } />
			);

			expect( screen.getByText( /This can take up to 10 minutes\./ ) ).toBeInTheDocument();
		}
	);
} );

describe( 'SiteGenerationView server recovery', () => {
	it( 'offers a reload when the site is ready but the editor is unavailable', async () => {
		const onReload = jest.fn();
		render(
			<SiteGenerationView
				state={ { ...idleState, status: 'failed', failureReason: 'editor-unavailable', steps: [] } }
				onReload={ onReload }
			/>
		);

		expect(
			screen.getByRole( 'heading', { name: 'Your site is ready, but we couldn’t open the editor' } )
		).toBeVisible();
		expect( screen.getByText( 'Reload this page to try again.' ) ).toBeVisible();
		expect( screen.queryByRole( 'button', { name: 'Start again' } ) ).not.toBeInTheDocument();
		await userEvent.click( screen.getByRole( 'button', { name: 'Reload' } ) );
		expect( onReload ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'renders the server failure copy and starts the rebuild', async () => {
		const retryBuild = jest.fn();
		render(
			<SiteGenerationView state={ { ...failedState, retryBuild } } onReload={ jest.fn() } />
		);

		expect( screen.getByText( 'We couldn’t finish building your site' ) ).toBeVisible();
		expect( screen.getByText( 'You can start the build again right away.' ) ).toBeVisible();

		await userEvent.click( screen.getByRole( 'button', { name: 'Start again' } ) );
		expect( retryBuild ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'falls back to reload when no server retry is offered', async () => {
		const onReload = jest.fn();
		render(
			<SiteGenerationView state={ { ...failedState, retryBuild: null } } onReload={ onReload } />
		);

		await userEvent.click( screen.getByRole( 'button', { name: 'Check again' } ) );
		expect( onReload ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'keeps the timed-out copy when the ui block carried no text', () => {
		render(
			<SiteGenerationView
				state={ {
					...failedState,
					failureReason: 'timed-out',
					failureLabel: undefined,
					failureDetail: undefined,
					retryBuild: null,
				} }
				onReload={ jest.fn() }
			/>
		);

		expect( screen.getByText( 'This is taking longer than expected' ) ).toBeVisible();
		expect( screen.getByText( 'Your brief is saved.' ) ).toBeVisible();
	} );

	it( 'disables the rebuild button while the retry request is in flight', () => {
		render(
			<SiteGenerationView
				state={ { ...failedState, isRetryingBuild: true } }
				onReload={ jest.fn() }
			/>
		);

		expect( screen.getByRole( 'button', { name: 'Start again' } ) ).toBeDisabled();
	} );
} );

describe( 'SiteGenerationView canvas tint', () => {
	const workingState: SiteGenerationState = {
		...idleState,
		status: 'working',
		steps: [ { id: 'preparing', label: 'Preparing the site', status: 'active' } ],
	};

	it( 'tints the canvas with a new hue on every tap of the preview', () => {
		const { container } = render(
			<SiteGenerationView onReload={ jest.fn() } state={ workingState } />
		);
		const editor = screen.getByRole( 'region', { name: 'Site generation' } );
		const preview = container.querySelector( '.site-generation__page-preview' ) as HTMLElement;

		expect( editor ).toHaveAttribute( 'data-tinted', 'false' );
		expect( container.querySelector( '.site-generation__tint' ) ).toBeNull();

		fireEvent.pointerUp( preview );

		const firstHue = editor.style.getPropertyValue( '--site-generation-hue' );
		expect( editor ).toHaveAttribute( 'data-tinted', 'true' );
		expect( firstHue ).not.toBe( '' );
		expect( container.querySelector( '.site-generation__tint' ) ).toBeVisible();

		fireEvent.pointerUp( preview );

		expect( editor ).toHaveAttribute( 'data-tinted', 'true' );
		expect( editor.style.getPropertyValue( '--site-generation-hue' ) ).not.toBe( firstHue );
	} );

	it( 'holds the tint, then fades it back to the default palette', () => {
		jest.useFakeTimers();

		try {
			const { container } = render(
				<SiteGenerationView onReload={ jest.fn() } state={ workingState } />
			);
			const editor = screen.getByRole( 'region', { name: 'Site generation' } );
			const preview = container.querySelector( '.site-generation__page-preview' ) as HTMLElement;

			fireEvent.pointerUp( preview );
			act( () => jest.advanceTimersByTime( TINT_HOLD_MS - 1 ) );
			expect( editor ).toHaveAttribute( 'data-tinted', 'true' );
			expect( editor ).toHaveAttribute( 'data-tint-fading', 'false' );

			act( () => jest.advanceTimersByTime( 1 ) );
			expect( editor ).toHaveAttribute( 'data-tinted', 'false' );
			expect( editor ).toHaveAttribute( 'data-tint-fading', 'true' );
			expect( container.querySelector( '.site-generation__tint' ) ).toBeVisible();

			fireTransitionEnd(
				container.querySelector( '.site-generation__tint' ) as HTMLElement,
				'background-color'
			);
			expect( editor ).toHaveAttribute( 'data-tint-fading', 'false' );
			expect( editor.style.getPropertyValue( '--site-generation-hue' ) ).toBe( '' );
			expect( container.querySelector( '.site-generation__tint' ) ).toBeNull();
		} finally {
			jest.useRealTimers();
		}
	} );
} );
