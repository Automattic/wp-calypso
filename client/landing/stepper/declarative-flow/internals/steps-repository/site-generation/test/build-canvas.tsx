/** @jest-environment jsdom */

import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BuildWowStreamCanvas } from '../stream/build-canvas';
import { initialStreamState } from '../stream/reducer';
import type { BuildWowStreamView } from '../stream/use-build-wow-stream';

type PreviewProps = {
	onImages?: ( images: Record< string, string > ) => void;
	onTour?: ( title: string | null ) => void;
	isActive: boolean;
	isGenerating: boolean;
	isComplete: boolean;
	onHomeReady?: ( ready: boolean ) => void;
	focus?: { route: string; nonce: number } | null;
};

const previewProps: { current: PreviewProps | null; mounts: number } = {
	current: null,
	mounts: 0,
};

jest.mock( '../stream/html-preview', () => {
	const { useEffect } = jest.requireActual( 'react' );
	return {
		BuildHtmlPreview: ( props: PreviewProps ) => {
			previewProps.current = props;
			useEffect( () => {
				previewProps.mounts += 1;
			}, [] );
			return <div data-testid="html-preview" />;
		},
	};
} );

jest.mock( '../stream/use-build-image-preview', () => ( {
	useBuildImagePreview: ( previewId: string | undefined ) =>
		previewId ? `data:image/png;base64,${ previewId.slice( 0, 8 ) }` : null,
} ) );

function streamView( overrides: Partial< BuildWowStreamView[ 'state' ] > = {}, runId = 'run-1' ) {
	return {
		info: {
			protocol: 1,
			blogId: 123,
			runId,
			capabilities: [ 'planning', 'design', 'preview:dsl-html' ],
			eventsUrl: 'https://example.test/events',
			snapshotUrl: 'https://example.test/snapshot',
			previewUrl: 'https://example.test/preview',
		},
		state: {
			...initialStreamState( runId ),
			plan: {
				status: 'completed',
				title: 'Mamma Mia',
				direction: 'A pastel bakery with a warm welcome.',
				palette: [ { name: 'Accent', color: '#814b60' } ],
				typography: [ { name: 'Fraunces', family: 'Fraunces', role: 'heading' } ],
				pages: null,
				images: null,
			},
			previews: {
				'/': { route: '/', documentId: 'a'.repeat( 64 ), epoch: '1:1', ready: false },
			},
			...overrides,
		},
	} as BuildWowStreamView;
}

beforeEach( () => {
	previewProps.current = null;
	previewProps.mounts = 0;
} );

it( 'starts on the compact design brief built from streamed plan fields', () => {
	render( <BuildWowStreamCanvas stream={ streamView() } /> );
	expect( screen.getByRole( 'heading', { name: 'Mamma Mia' } ) ).toBeVisible();
	expect( screen.getByText( 'A pastel bakery with a warm welcome.' ) ).toBeVisible();
	expect( screen.getByText( 'Fraunces' ) ).toBeVisible();
	expect( screen.getByText( 'Accent, #814b60' ) ).toBeVisible();
	expect( screen.getByRole( 'region', { name: 'Live site build' } ) ).toHaveAttribute(
		'data-view',
		'design'
	);
	expect( screen.getByTestId( 'html-preview' ).parentElement ).toHaveAttribute(
		'aria-hidden',
		'true'
	);
	expect( previewProps.current?.isActive ).toBe( false );
	expect( previewProps.current?.isGenerating ).toBe( true );
} );

it( 'keeps palette names for screen readers and shows them in a tooltip on hover', async () => {
	const user = userEvent.setup();
	const { container } = render( <BuildWowStreamCanvas stream={ streamView() } /> );
	expect( container.querySelector( '.site-generation-canvas__swatch-name' ) ).toBeNull();
	expect( screen.queryByRole( 'tooltip' ) ).not.toBeInTheDocument();
	await user.hover( container.querySelector( '.site-generation-canvas__swatch-chip' )! );
	expect( await screen.findByRole( 'tooltip' ) ).toHaveTextContent( 'Accent · #814b60' );
} );

it( 'hands off to the site once the homepage is ready and reports it', () => {
	const onPreviewReady = jest.fn();
	render( <BuildWowStreamCanvas onPreviewReady={ onPreviewReady } stream={ streamView() } /> );
	act( () => previewProps.current?.onHomeReady?.( true ) );
	expect( screen.getByTestId( 'html-preview' ).parentElement ).toHaveAttribute(
		'aria-hidden',
		'false'
	);
	expect( screen.getByRole( 'region', { name: 'Live site build' } ) ).toHaveAttribute(
		'data-view',
		'site'
	);
	expect( previewProps.current?.isActive ).toBe( true );
	expect( onPreviewReady ).toHaveBeenCalledWith( true );
} );

it( 'keeps the preview mounted through homepage readiness changes after handoff', () => {
	render( <BuildWowStreamCanvas stream={ streamView() } /> );
	act( () => previewProps.current?.onHomeReady?.( true ) );
	act( () => previewProps.current?.onHomeReady?.( false ) );
	act( () => previewProps.current?.onHomeReady?.( true ) );
	expect( screen.getByTestId( 'html-preview' ).parentElement ).not.toHaveAttribute( 'inert' );
	expect( screen.queryByRole( 'heading', { name: 'Mamma Mia' } ) ).not.toBeInTheDocument();
	expect( previewProps.mounts ).toBe( 1 );
} );

describe( 'switching between the design and the site', () => {
	it( 'is offered only once the homepage has rendered', () => {
		render( <BuildWowStreamCanvas stream={ streamView() } /> );
		expect( screen.queryByRole( 'radiogroup', { name: 'Preview view' } ) ).not.toBeInTheDocument();
		act( () => previewProps.current?.onHomeReady?.( true ) );
		expect( screen.getByRole( 'radio', { name: 'Preview' } ) ).toBeChecked();
		expect( screen.getByRole( 'radio', { name: 'Design' } ) ).not.toBeChecked();
	} );

	it( 'goes back to the design brief and returns to the site without remounting the preview', async () => {
		const user = userEvent.setup();
		const onPreviewReady = jest.fn();
		render( <BuildWowStreamCanvas onPreviewReady={ onPreviewReady } stream={ streamView() } /> );
		act( () => previewProps.current?.onHomeReady?.( true ) );

		await user.click( screen.getByRole( 'radio', { name: 'Design' } ) );
		expect( screen.getByRole( 'region', { name: 'Live site build' } ) ).toHaveAttribute(
			'data-view',
			'design'
		);
		expect( screen.getByRole( 'heading', { name: 'Mamma Mia' } ) ).toBeVisible();
		expect( screen.getByTestId( 'html-preview' ).parentElement ).toHaveAttribute( 'inert' );
		expect( previewProps.current?.isActive ).toBe( false );
		expect( onPreviewReady ).toHaveBeenLastCalledWith( false );

		await user.click( screen.getByRole( 'radio', { name: 'Preview' } ) );
		expect( screen.getByRole( 'region', { name: 'Live site build' } ) ).toHaveAttribute(
			'data-view',
			'site'
		);
		expect( previewProps.current?.isActive ).toBe( true );
		expect( onPreviewReady ).toHaveBeenLastCalledWith( true );
		expect( previewProps.mounts ).toBe( 1 );
	} );

	it( 'moves between the views with the arrow keys', async () => {
		const user = userEvent.setup();
		render( <BuildWowStreamCanvas stream={ streamView() } /> );
		act( () => previewProps.current?.onHomeReady?.( true ) );
		screen.getByRole( 'radio', { name: 'Preview' } ).focus();
		await user.keyboard( '{ArrowLeft}' );
		expect( screen.getByRole( 'radio', { name: 'Design' } ) ).toBeChecked();
		expect( screen.getByRole( 'radio', { name: 'Design' } ) ).toHaveFocus();
		await user.keyboard( '{ArrowRight}' );
		expect( screen.getByRole( 'radio', { name: 'Preview' } ) ).toBeChecked();
		expect( screen.getByRole( 'radio', { name: 'Preview' } ) ).toHaveFocus();
	} );

	it( 'keeps the chosen view when the homepage re-renders', async () => {
		const user = userEvent.setup();
		render( <BuildWowStreamCanvas stream={ streamView() } /> );
		act( () => previewProps.current?.onHomeReady?.( true ) );
		await user.click( screen.getByRole( 'radio', { name: 'Design' } ) );
		act( () => previewProps.current?.onHomeReady?.( false ) );
		act( () => previewProps.current?.onHomeReady?.( true ) );
		expect( screen.getByRole( 'region', { name: 'Live site build' } ) ).toHaveAttribute(
			'data-view',
			'design'
		);
	} );

	it( 'starts the next build on the design with the switch hidden', async () => {
		const user = userEvent.setup();
		const { rerender } = render( <BuildWowStreamCanvas stream={ streamView() } /> );
		act( () => previewProps.current?.onHomeReady?.( true ) );
		await user.click( screen.getByRole( 'radio', { name: 'Design' } ) );
		await user.click( screen.getByRole( 'radio', { name: 'Preview' } ) );
		rerender(
			<BuildWowStreamCanvas
				stream={ streamView( {
					previews: {
						'/': { route: '/', documentId: 'b'.repeat( 64 ), epoch: '1:2', ready: false },
					},
				} ) }
			/>
		);
		expect( screen.getByRole( 'region', { name: 'Live site build' } ) ).toHaveAttribute(
			'data-view',
			'design'
		);
		expect( screen.queryByRole( 'radiogroup', { name: 'Preview view' } ) ).not.toBeInTheDocument();
	} );
} );

it( 'waits for the first usable preview before offering navigation', () => {
	const { rerender } = render( <BuildWowStreamCanvas stream={ streamView( { previews: {} } ) } /> );
	expect( screen.queryByRole( 'radiogroup', { name: 'Preview view' } ) ).not.toBeInTheDocument();
	rerender( <BuildWowStreamCanvas stream={ streamView() } /> );
	act( () => previewProps.current?.onHomeReady?.( true ) );
	expect( screen.getByRole( 'region', { name: 'Live site build' } ) ).toHaveAttribute(
		'data-view',
		'site'
	);
} );

it( 'starts the handoff over when the preview epoch changes', () => {
	const onPreviewReady = jest.fn();
	const { rerender } = render(
		<BuildWowStreamCanvas onPreviewReady={ onPreviewReady } stream={ streamView() } />
	);
	act( () => previewProps.current?.onHomeReady?.( true ) );
	expect( onPreviewReady ).toHaveBeenLastCalledWith( true );
	rerender(
		<BuildWowStreamCanvas
			onPreviewReady={ onPreviewReady }
			stream={ streamView( {
				previews: {
					'/': { route: '/', documentId: 'b'.repeat( 64 ), epoch: '1:2', ready: false },
				},
			} ) }
		/>
	);
	expect( screen.getByRole( 'region', { name: 'Live site build' } ) ).toHaveAttribute(
		'data-view',
		'design'
	);
	expect( onPreviewReady ).toHaveBeenLastCalledWith( false );
} );

it( 'shows placeholders only for undecided design fields while generating', () => {
	const { rerender } = render( <BuildWowStreamCanvas stream={ streamView( { plan: null } ) } /> );
	expect( screen.getByRole( 'heading', { name: 'Your site is taking shape' } ) ).toBeVisible();
	expect( screen.getByRole( 'heading', { name: 'Typography' } ) ).toBeVisible();
	expect( screen.getByRole( 'heading', { name: 'Palette' } ) ).toBeVisible();
	rerender( <BuildWowStreamCanvas hostState="ready" stream={ streamView( { plan: null } ) } /> );
	expect( screen.queryByRole( 'heading', { name: 'Typography' } ) ).not.toBeInTheDocument();
} );

it( 'resets the handoff for a new run', () => {
	const { rerender } = render( <BuildWowStreamCanvas stream={ streamView() } /> );
	act( () => previewProps.current?.onHomeReady?.( true ) );
	rerender( <BuildWowStreamCanvas stream={ streamView( {}, 'run-2' ) } /> );
	expect( screen.getByRole( 'region', { name: 'Live site build' } ) ).toHaveAttribute(
		'data-view',
		'design'
	);
	expect( previewProps.mounts ).toBe( 2 );
} );

it.each( [
	[ 'host finishing', 'finishing', {}, false ],
	[ 'host ready', 'ready', {}, false ],
	[ 'engine failed', undefined, { engineTerminal: 'failed' as const }, false ],
	[ 'engine paused', undefined, { engineTerminal: 'paused' as const }, false ],
	[ 'host generating', 'generating', {}, true ],
	[ 'no host state', undefined, {}, true ],
] )( 'derives generation: %s', ( _label, hostState, overrides, expected ) => {
	render( <BuildWowStreamCanvas hostState={ hostState } stream={ streamView( overrides ) } /> );
	expect( previewProps.current?.isGenerating ).toBe( expected );
} );

it( 'passes authoritative completion to the preview', () => {
	render( <BuildWowStreamCanvas hostState="ready" stream={ streamView() } /> );
	expect( previewProps.current?.isComplete ).toBe( true );
} );

it( 'shows real design progress until completion and then stops loading', () => {
	const developing = streamView();
	developing.state.plan!.status = 'developing';
	const { rerender, container } = render( <BuildWowStreamCanvas stream={ developing } /> );
	expect( container.querySelector( '.site-generation-canvas__brief' ) ).toHaveAttribute(
		'data-loading',
		'true'
	);
	rerender( <BuildWowStreamCanvas stream={ streamView() } /> );
	expect( container.querySelector( '.site-generation-canvas__brief' ) ).toHaveAttribute(
		'data-loading',
		'false'
	);
	expect( container.querySelector( '.components-spinner' ) ).toBeNull();
} );

it.each( [ 'failed', 'paused', 'completed' ] as const )(
	'stops design loading when the engine is %s',
	( engineTerminal ) => {
		const { container } = render(
			<BuildWowStreamCanvas stream={ streamView( { plan: null, engineTerminal } ) } />
		);
		expect( container.querySelector( '.components-spinner' ) ).toBeNull();
		expect( container.querySelector( '.site-generation-canvas__placeholder' ) ).toBeNull();
	}
);

it( 'keeps design slots while a replacement proposal has empty fields', () => {
	const previous = streamView();
	const { rerender, container } = render( <BuildWowStreamCanvas stream={ previous } /> );
	const replacement = streamView( {
		plan: { ...previous.state.plan!, status: 'developing', typography: [], palette: [] },
	} );
	rerender( <BuildWowStreamCanvas stream={ replacement } /> );
	expect( screen.getByRole( 'heading', { name: 'Typography' } ) ).toBeVisible();
	expect( screen.getByRole( 'heading', { name: 'Palette' } ) ).toBeVisible();
	expect( screen.queryByText( 'Fraunces' ) ).not.toBeInTheDocument();
	expect( container.querySelector( '.site-generation-canvas__placeholder' ) ).toBeVisible();
	rerender(
		<BuildWowStreamCanvas
			stream={ streamView( { plan: { ...replacement.state.plan!, status: 'completed' } } ) }
		/>
	);
	expect( container.querySelector( '.site-generation-canvas__placeholder' ) ).toBeNull();
	expect( screen.queryByRole( 'heading', { name: 'Typography' } ) ).not.toBeInTheDocument();
} );

describe( 'planned pages', () => {
	it( 'lists the planned pages with a total section count, without section names', () => {
		const base = streamView().state.plan!;
		render(
			<BuildWowStreamCanvas
				stream={ streamView( {
					plan: {
						...base,
						pages: [
							{ slug: 'home', title: 'Home', sections: [ 'Welcome', 'Menu', 'Visit' ] },
							{ slug: 'about', title: 'About', sections: [ 'Story', 'Team' ] },
						],
					},
				} ) }
			/>
		);
		expect( screen.getByRole( 'heading', { name: 'Pages' } ) ).toBeVisible();
		expect( screen.getByText( '5 sections' ) ).toBeVisible();
		expect( screen.getByText( 'Home' ) ).toBeVisible();
		expect( screen.getByText( 'About' ) ).toBeVisible();
		expect( screen.queryByText( 'Welcome' ) ).not.toBeInTheDocument();
	} );

	it( 'uses singular wording and leaves out a section count of zero', () => {
		const base = streamView().state.plan!;
		const { rerender } = render(
			<BuildWowStreamCanvas
				stream={ streamView( {
					plan: { ...base, pages: [ { slug: 'home', title: 'Home', sections: [ 'Welcome' ] } ] },
				} ) }
			/>
		);
		expect( screen.getByText( '1 section' ) ).toBeVisible();
		rerender(
			<BuildWowStreamCanvas
				stream={ streamView( {
					plan: { ...base, pages: [ { slug: 'home', title: 'Home', sections: [] } ] },
				} ) }
			/>
		);
		expect( screen.getByText( 'Home' ) ).toBeVisible();
		expect( screen.queryByText( /section/ ) ).not.toBeInTheDocument();
	} );

	it( 'holds a place for the pages while the plan is still developing', () => {
		const base = streamView().state.plan!;
		const { container } = render(
			<BuildWowStreamCanvas
				stream={ streamView( { plan: { ...base, status: 'developing', pages: null } } ) }
			/>
		);
		expect( screen.getByRole( 'heading', { name: 'Pages' } ) ).toBeVisible();
		expect(
			container.querySelector(
				'.site-generation-canvas__pages .site-generation-canvas__placeholder'
			)
		).toBeVisible();
	} );

	it( 'omits the pages when the plan decided on none or the graph does not plan', () => {
		const base = streamView().state.plan!;
		const { rerender } = render(
			<BuildWowStreamCanvas stream={ streamView( { plan: { ...base, pages: [] } } ) } />
		);
		expect( screen.queryByRole( 'heading', { name: 'Pages' } ) ).not.toBeInTheDocument();
		const unplanned = streamView( { plan: null } );
		unplanned.info.capabilities = [ 'preview:dsl-html' ];
		rerender( <BuildWowStreamCanvas stream={ unplanned } /> );
		expect( screen.queryByRole( 'heading', { name: 'Pages' } ) ).not.toBeInTheDocument();
	} );
} );

describe( 'image tiles', () => {
	const READY_ID = 'c'.repeat( 64 );
	const queries = ( count: number ) =>
		Array.from( { length: count }, ( _, index ) => ( {
			query: `Image ${ index + 1 }`,
			aspectRatio: null,
		} ) );

	function imageStream(
		images: BuildWowStreamView[ 'state' ][ 'images' ],
		planned: number | null,
		overrides: Partial< BuildWowStreamView[ 'state' ] > = {}
	) {
		const base = streamView().state.plan!;
		const view = streamView( {
			images,
			plan: { ...base, images: planned === null ? null : queries( planned ) },
			...overrides,
		} );
		view.info.capabilities = [ 'planning', 'design', 'images', 'preview:dsl-html' ];
		return view;
	}

	it( 'shows each planned image as a tile that fills in when its picture is ready', () => {
		const { container } = render(
			<BuildWowStreamCanvas
				stream={ imageStream(
					{
						'hero.png': {
							status: 'ready',
							url: '/wp-content/themes/demo/assets/hero.png',
							previewId: READY_ID,
							query: 'Image 1',
							aspectRatio: '16:9',
						},
						'team.png': { status: 'generating', url: null, query: 'Image 2', aspectRatio: null },
					},
					3
				) }
			/>
		);
		expect( screen.getByRole( 'heading', { name: 'Images' } ) ).toBeVisible();
		expect( screen.getByText( '1 of 3 ready' ) ).toBeVisible();
		expect( container.querySelectorAll( '.site-generation-canvas__image' ) ).toHaveLength( 3 );
		const pictures = container.querySelectorAll( '.site-generation-canvas__image img' );
		expect( pictures ).toHaveLength( 1 );
		expect( pictures[ 0 ] ).toHaveAttribute(
			'src',
			expect.stringMatching( /^data:image\/png;base64,/ )
		);
		expect( pictures[ 0 ] ).toHaveAttribute( 'alt', '' );
	} );

	it( 'fills a tile from the image the preview loaded, matching by file name or path', () => {
		const { container } = render(
			<BuildWowStreamCanvas
				stream={ imageStream(
					{
						'dsl-image-abc.png': {
							status: 'ready',
							url: null,
							query: 'Image 1',
							aspectRatio: '4:5',
						},
						'team.png': {
							status: 'ready',
							url: '/wp-content/themes/demo/assets/team.png?v=1',
							query: 'Image 2',
							aspectRatio: null,
						},
						'later.png': { status: 'ready', url: null, query: 'Image 3', aspectRatio: null },
					},
					3
				) }
			/>
		);
		expect( container.querySelectorAll( '.site-generation-canvas__image img' ) ).toHaveLength( 0 );
		act( () =>
			previewProps.current?.onImages?.( {
				'/wp-content/themes/demo/assets/dsl-image-abc.png?v=9': 'blob:abc',
				'/wp-content/themes/demo/assets/team.png?v=1': 'blob:team',
				'/wp-content/themes/demo/assets/fonts/heading.woff2': 'blob:font',
			} )
		);
		const pictures = container.querySelectorAll( '.site-generation-canvas__image img' );
		expect( Array.from( pictures, ( picture ) => picture.getAttribute( 'src' ) ) ).toEqual( [
			'blob:abc',
			'blob:team',
		] );
		expect( container.querySelectorAll( '.site-generation-canvas__image' ) ).toHaveLength( 3 );
	} );

	it( 'shows the site mark whole rather than cropped', () => {
		const { container } = render(
			<BuildWowStreamCanvas
				stream={ imageStream(
					{ 'site-logo.png': { status: 'ready', url: null, query: 'Mark', aspectRatio: '1:1' } },
					1
				) }
			/>
		);
		act( () =>
			previewProps.current?.onImages?.( {
				'/wp-content/themes/demo/assets/site-logo.png?v=3': 'blob:logo',
			} )
		);
		expect( container.querySelector( '.site-generation-canvas__image img' ) ).toHaveClass(
			'is-mark'
		);
	} );

	it( 'caps the strip but still counts every image', () => {
		const { container } = render( <BuildWowStreamCanvas stream={ imageStream( {}, 12 ) } /> );
		expect( screen.getByText( '0 of 12 ready' ) ).toBeVisible();
		expect( container.querySelectorAll( '.site-generation-canvas__image' ) ).toHaveLength( 8 );
	} );

	it( 'captions each pending tile with what the plan is drawing', () => {
		render( <BuildWowStreamCanvas stream={ imageStream( {}, 2 ) } /> );
		expect( screen.getByText( 'Image 1' ) ).toBeVisible();
		expect( screen.getByText( 'Image 2' ) ).toBeVisible();
	} );

	it( 'captions the pending tiles with the subjects not yet reported', () => {
		const { container } = render(
			<BuildWowStreamCanvas
				stream={ imageStream(
					{ 'two.png': { status: 'generating', url: null, query: 'Image 2', aspectRatio: null } },
					3
				) }
			/>
		);
		expect( container.querySelectorAll( '.site-generation-canvas__image' ) ).toHaveLength( 3 );
		expect( screen.getByText( 'Image 1' ) ).toBeVisible();
		expect( screen.getByText( 'Image 3' ) ).toBeVisible();
	} );

	it( 'marks the tile whose picture is being drawn', () => {
		const { container } = render(
			<BuildWowStreamCanvas
				stream={ imageStream(
					{ 'two.png': { status: 'generating', url: null, query: 'Image 2', aspectRatio: null } },
					2
				) }
			/>
		);
		expect( container.querySelectorAll( '.site-generation-canvas__image-pending' ) ).toHaveLength(
			2
		);
		expect(
			container.querySelectorAll( '.site-generation-canvas__image-pending.is-generating' )
		).toHaveLength( 1 );
	} );

	it( 'keeps the slot of a picture that failed, held still', () => {
		const { container } = render(
			<BuildWowStreamCanvas
				stream={ imageStream(
					{ 'one.png': { status: 'failed', url: null, query: 'Image 1', aspectRatio: null } },
					2
				) }
			/>
		);
		expect( container.querySelectorAll( '.site-generation-canvas__image' ) ).toHaveLength( 2 );
		expect(
			container.querySelectorAll( '.site-generation-canvas__image-pending.is-settled' )
		).toHaveLength( 1 );
		expect( screen.getByText( 'Image 1' ) ).toBeVisible();
		expect( screen.getByText( 'Image 2' ) ).toBeVisible();
	} );

	it( 'captions the site mark as the logo, whatever the engine named its file', () => {
		render(
			<BuildWowStreamCanvas
				stream={ imageStream(
					{
						'site-logo.png': {
							status: 'generating',
							url: null,
							query: 'rhythm-pulse-mark.png',
							aspectRatio: null,
						},
					},
					1
				) }
			/>
		);
		expect( screen.getByText( 'Logo' ) ).toBeVisible();
		expect( screen.queryByText( 'pulse mark' ) ).not.toBeInTheDocument();
	} );

	it( 'reads a file-style image name as words without the site name', () => {
		const base = streamView().state.plan!;
		render(
			<BuildWowStreamCanvas
				stream={ streamView( {
					plan: {
						...base,
						images: [ { query: 'mamma-mia-hero-cannoli.png', aspectRatio: null } ],
					},
				} ) }
			/>
		);
		expect( screen.getByText( 'hero cannoli' ) ).toBeVisible();
	} );

	it( 'holds a row of placeholders until the plan names its images', () => {
		const { container } = render(
			<BuildWowStreamCanvas stream={ imageStream( {}, null, { plan: null } ) } />
		);
		expect( screen.getByRole( 'heading', { name: 'Images' } ) ).toBeVisible();
		expect(
			container.querySelectorAll(
				'.site-generation-canvas__images .site-generation-canvas__placeholder'
			)
		).toHaveLength( 4 );
	} );

	it( 'holds its slots still when the plan decided on no photos, and omits the block when the graph has none', () => {
		const { container, rerender } = render(
			<BuildWowStreamCanvas
				stream={ imageStream(
					{
						'site-logo.png': {
							status: 'generating',
							url: null,
							query: 'journal-mark.png',
							aspectRatio: null,
						},
					},
					0
				) }
			/>
		);
		expect( screen.getByRole( 'heading', { name: 'Images' } ) ).toBeVisible();
		expect(
			container.querySelectorAll( '.site-generation-canvas__image-pending.is-settled' )
		).toHaveLength( 4 );
		expect( screen.queryByText( 'Logo' ) ).not.toBeInTheDocument();
		const plain = streamView( { plan: null } );
		rerender( <BuildWowStreamCanvas stream={ plain } /> );
		expect( screen.queryByRole( 'heading', { name: 'Images' } ) ).not.toBeInTheDocument();
	} );
} );

describe( 'section progress', () => {
	const pages = [
		{ slug: 'home', title: 'Home', sections: [ 'Welcome', 'Menu', 'Visit' ] },
		{ slug: 'about', title: 'About', sections: [ 'Story', 'Team' ] },
	];

	function pagedStream( sections: BuildWowStreamView[ 'state' ][ 'sections' ] ) {
		const base = streamView().state.plan!;
		return streamView( { plan: { ...base, status: 'developing', pages }, sections } );
	}

	it( 'counts built sections against the plan and marks the page being built', () => {
		const { container } = render(
			<BuildWowStreamCanvas
				stream={ pagedStream( {
					'/': {
						0: { kind: 'content', name: 'Welcome', partial: false },
						1: { kind: 'content', name: 'Menu', partial: true },
					},
				} ) }
			/>
		);
		expect( screen.getByText( '1 of 5 sections built' ) ).toBeVisible();
		const chips = container.querySelectorAll( '.site-generation-canvas__page-list li' );
		expect( chips[ 0 ] ).toHaveAttribute( 'data-progress', 'building' );
		expect( chips[ 1 ] ).toHaveAttribute( 'data-progress', 'pending' );
	} );

	it( 'matches section routes to pages with or without a leading slash', () => {
		const { container } = render(
			<BuildWowStreamCanvas
				stream={ pagedStream( {
					home: {
						0: { kind: 'content', name: 'Welcome', partial: false },
						1: { kind: 'content', name: 'Menu', partial: false },
						2: { kind: 'content', name: 'Visit', partial: false },
					},
					'/about': { 0: { kind: 'content', name: 'Story', partial: false } },
				} ) }
			/>
		);
		expect( screen.getByText( '4 of 5 sections built' ) ).toBeVisible();
		const chips = container.querySelectorAll( '.site-generation-canvas__page-list li' );
		expect( chips[ 0 ] ).toHaveAttribute( 'data-progress', 'done' );
		expect( chips[ 1 ] ).toHaveAttribute( 'data-progress', 'building' );
	} );

	it( 'marks pages from their previews when the build streams no sections', () => {
		const base = streamView().state.plan!;
		const { container } = render(
			<BuildWowStreamCanvas
				stream={ streamView( {
					plan: { ...base, status: 'developing', pages },
					previews: {
						'/': { route: '/', documentId: 'a'.repeat( 64 ), epoch: '1:1', ready: true },
						'/about/': {
							route: '/about/',
							documentId: 'b'.repeat( 64 ),
							epoch: '1:1',
							ready: false,
						},
					},
				} ) }
			/>
		);
		expect( screen.getByText( '5 sections' ) ).toBeVisible();
		const chips = container.querySelectorAll( '.site-generation-canvas__page-list li' );
		expect( chips[ 0 ] ).toHaveAttribute( 'data-progress', 'done' );
		expect( chips[ 1 ] ).toHaveAttribute( 'data-progress', 'building' );
	} );

	it( 'marks every page done once the site is ready', () => {
		const base = streamView().state.plan!;
		const { container } = render(
			<BuildWowStreamCanvas
				hostState="ready"
				stream={ streamView( { plan: { ...base, pages } } ) }
			/>
		);
		expect(
			Array.from( container.querySelectorAll( '.site-generation-canvas__page-list li' ) ).map(
				( chip ) => chip.getAttribute( 'data-progress' )
			)
		).toEqual( [ 'done', 'done' ] );
	} );

	it( 'marks every page building as soon as the plan is complete, before any preview arrives', () => {
		const base = streamView().state.plan!;
		const progress = ( container: HTMLElement ) =>
			Array.from( container.querySelectorAll( '.site-generation-canvas__page-list li' ) ).map(
				( chip ) => chip.getAttribute( 'data-progress' )
			);
		const { container, rerender } = render(
			<BuildWowStreamCanvas
				hostState="generating"
				stream={ streamView( { plan: { ...base, status: 'developing', pages }, previews: {} } ) }
			/>
		);
		expect( progress( container ) ).toEqual( [ 'pending', 'pending' ] );
		rerender(
			<BuildWowStreamCanvas
				hostState="generating"
				stream={ streamView( { plan: { ...base, pages }, previews: {} } ) }
			/>
		);
		expect( progress( container ) ).toEqual( [ 'building', 'building' ] );
	} );

	it( 'keeps the plain planned count until a section has been built', () => {
		render( <BuildWowStreamCanvas stream={ pagedStream( {} ) } /> );
		expect( screen.getByText( '5 sections' ) ).toBeVisible();
		expect( screen.queryByText( /built/ ) ).not.toBeInTheDocument();
	} );
} );

describe( 'branding the brief', () => {
	it( 'sets the title in the heading face and tints the canvas with the palette', () => {
		render( <BuildWowStreamCanvas stream={ streamView() } /> );
		const title = screen.getByRole( 'heading', { name: 'Mamma Mia' } );
		expect( title ).toHaveClass( 'is-branded' );
		expect( title.style.fontFamily ).toContain( 'Fraunces' );
		expect(
			screen
				.getByRole( 'region', { name: 'Live site build' } )
				.style.getPropertyValue( '--site-generation-brand' )
		).toBe( '#814b60' );
	} );

	it( 'leaves the canvas untinted until a palette names a primary or accent', () => {
		const base = streamView().state.plan!;
		render(
			<BuildWowStreamCanvas
				stream={ streamView( {
					plan: { ...base, palette: [ { name: 'Base', color: '#ffffff' } ], typography: [] },
				} ) }
			/>
		);
		expect( screen.getByRole( 'heading', { name: 'Mamma Mia' } ) ).not.toHaveClass( 'is-branded' );
		expect(
			screen
				.getByRole( 'region', { name: 'Live site build' } )
				.style.getPropertyValue( '--site-generation-brand' )
		).toBe( '' );
	} );
} );

describe( 'jumping to a page', () => {
	const pages = [
		{ slug: 'home', title: 'Home', sections: [ 'Welcome' ] },
		{ slug: 'menu', title: 'Menu', sections: [ 'Dishes' ] },
	];

	it( 'turns the chips into buttons once the site view exists and brings the page into view', async () => {
		const user = userEvent.setup();
		const base = streamView().state.plan!;
		const view = streamView( {
			plan: { ...base, pages },
			previews: {
				'/': { route: '/', documentId: 'a'.repeat( 64 ), epoch: '1:1', ready: true },
				'/menu/': { route: '/menu/', documentId: 'b'.repeat( 64 ), epoch: '1:1', ready: false },
			},
		} );
		render( <BuildWowStreamCanvas stream={ view } /> );
		expect(
			screen.queryByRole( 'button', { name: 'Show the Menu page' } )
		).not.toBeInTheDocument();
		act( () => previewProps.current?.onHomeReady?.( true ) );
		await user.click( screen.getByRole( 'radio', { name: 'Design' } ) );
		await user.click( screen.getByRole( 'button', { name: 'Show the Menu page' } ) );
		expect( previewProps.current?.focus?.route ).toBe( '/menu/' );
		expect( screen.getByRole( 'region', { name: 'Live site build' } ) ).toHaveAttribute(
			'data-view',
			'site'
		);
	} );
} );

describe( 'font labels', () => {
	it( 'names the font family when the typeface name only repeats its role', () => {
		const base = streamView().state.plan!;
		render(
			<BuildWowStreamCanvas
				stream={ streamView( {
					plan: {
						...base,
						typography: [
							{ name: 'Heading', family: 'Lora, serif', role: 'heading' },
							{ name: 'Body', family: 'Inter, sans-serif', role: 'body' },
						],
					},
				} ) }
			/>
		);
		expect( screen.getByText( 'Lora' ) ).toBeVisible();
		expect( screen.getByText( 'Inter' ) ).toBeVisible();
		expect( screen.queryByText( 'Heading' ) ).not.toBeInTheDocument();
		expect( screen.getByText( 'heading' ) ).toBeVisible();
	} );
} );

describe( 'finishing state', () => {
	function finishedStream( imageStatus: 'ready' | 'generating' ) {
		const base = streamView().state.plan!;
		const view = streamView( {
			plan: { ...base, images: [ { query: 'Bread', aspectRatio: null } ] },
			images: {
				'hero.png': {
					status: imageStatus,
					url: imageStatus === 'ready' ? '/wp-content/themes/demo/hero.png' : null,
					query: 'Bread',
					aspectRatio: null,
				},
			},
		} );
		view.info.capabilities = [ 'planning', 'design', 'images', 'preview:dsl-html' ];
		return view;
	}

	it( 'shows the current step on the brief once the design and images are complete', () => {
		const { container } = render(
			<BuildWowStreamCanvas
				activityLabel="Polishing your site"
				hostState="generating"
				stream={ finishedStream( 'ready' ) }
			/>
		);
		expect( container.querySelector( '.site-generation-canvas__brief' ) ).toHaveAttribute(
			'data-finishing',
			'true'
		);
		expect( container.querySelector( '.site-generation-canvas__status-line' ) ).toHaveTextContent(
			'Polishing your site'
		);
		expect( screen.getByRole( 'status' ) ).toBeEmptyDOMElement();
		expect( screen.getByRole( 'region', { name: 'Live site build' } ) ).toHaveAttribute(
			'data-finishing',
			'true'
		);
	} );

	it( 'closes with a ready line once the host says the site is live', () => {
		const { container } = render(
			<BuildWowStreamCanvas hostState="ready" stream={ finishedStream( 'ready' ) } />
		);
		expect( screen.getByRole( 'status' ) ).toHaveTextContent( 'Your site is ready' );
		expect( container.querySelector( '.site-generation-canvas__status-line' ) ).toHaveTextContent(
			'Your site is ready'
		);
	} );

	it( 'names the page the walk is on without reading it out', () => {
		const { container } = render(
			<BuildWowStreamCanvas
				activityLabel="Polishing your site"
				hostState="generating"
				stream={ finishedStream( 'ready' ) }
			/>
		);
		act( () => previewProps.current?.onTour?.( 'Menu' ) );
		expect( container.querySelector( '.site-generation-canvas__status-line' ) ).toHaveTextContent(
			'Polishing your site · Menu'
		);
		expect( screen.getByRole( 'status' ) ).toBeEmptyDOMElement();
	} );

	it( 'carries the host step after the engine has finished its own work', () => {
		const base = streamView();
		const done = streamView( { ...base.state, engineTerminal: 'completed' } );
		const { container } = render(
			<BuildWowStreamCanvas
				activityLabel="Doing final checks"
				hostState="generating"
				stream={ done }
			/>
		);
		expect( container.querySelector( '.site-generation-canvas__status-line' ) ).toHaveTextContent(
			'Doing final checks'
		);
	} );

	it( 'stays quiet while images are still arriving or once the site is ready', () => {
		const { container, rerender } = render(
			<BuildWowStreamCanvas
				activityLabel="Adding your images"
				hostState="generating"
				stream={ finishedStream( 'generating' ) }
			/>
		);
		expect( container.querySelector( '.site-generation-canvas__brief' ) ).toHaveAttribute(
			'data-finishing',
			'false'
		);
		expect( container.querySelector( '.site-generation-canvas__status-line' ) ).toBeNull();
		expect( screen.getByRole( 'status' ) ).toBeEmptyDOMElement();
		rerender(
			<BuildWowStreamCanvas
				activityLabel="Doing final checks"
				hostState="ready"
				stream={ finishedStream( 'ready' ) }
			/>
		);
		expect( container.querySelector( '.site-generation-canvas__brief' ) ).toHaveAttribute(
			'data-finishing',
			'false'
		);
	} );

	it( 'does not count the site mark toward the planned images, and counts a failure as settled', () => {
		const base = streamView().state.plan!;
		const settled = ( query: string, status: 'ready' | 'failed' = 'ready' ) => ( {
			status,
			url: null,
			query,
			aspectRatio: null,
		} );
		const plan = {
			...base,
			images: [
				{ query: 'Bread', aspectRatio: null },
				{ query: 'Cake', aspectRatio: null },
			],
		};
		const { container, rerender } = render(
			<BuildWowStreamCanvas
				activityLabel="Adding your images"
				hostState="generating"
				stream={ streamView( {
					plan,
					images: { 'bread.png': settled( 'Bread' ), 'site-logo.png': settled( 'Logo' ) },
				} ) }
			/>
		);
		const brief = () => container.querySelector( '.site-generation-canvas__brief' );
		expect( brief() ).toHaveAttribute( 'data-finishing', 'false' );
		rerender(
			<BuildWowStreamCanvas
				activityLabel="Adding your images"
				hostState="generating"
				stream={ streamView( {
					plan,
					images: {
						'bread.png': settled( 'Bread' ),
						'cake.png': settled( 'Cake', 'failed' ),
						'site-logo.png': settled( 'Logo' ),
					},
				} ) }
			/>
		);
		expect( brief() ).toHaveAttribute( 'data-finishing', 'true' );
	} );
} );
