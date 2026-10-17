/** @jest-environment jsdom */

import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BuildWowStreamCanvas } from '../stream/build-canvas';
import { initialStreamState } from '../stream/reducer';
import type { BuildWowStreamView } from '../stream/use-build-wow-stream';

type PreviewProps = {
	onImages?: ( images: Record< string, string > ) => void;
	isActive: boolean;
	isGenerating: boolean;
	isComplete: boolean;
	onHomeReady?: ( ready: boolean ) => void;
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
	expect( screen.getByLabelText( 'Accent, #814b60' ) ).toBeVisible();
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
		expect( screen.getByRole( 'radio', { name: 'Pages' } ) ).toBeChecked();
		expect( screen.getByRole( 'radio', { name: 'Design' } ) ).not.toBeChecked();
	} );

	it( 'names the second view after the pages being built', () => {
		const plan = streamView().state.plan!;
		const withPages = ( slugs: string[] ) =>
			streamView( {
				plan: { ...plan, pages: slugs.map( ( slug ) => ( { slug, title: slug, sections: [] } ) ) },
			} );
		const { rerender } = render( <BuildWowStreamCanvas stream={ withPages( [ 'home' ] ) } /> );
		act( () => previewProps.current?.onHomeReady?.( true ) );
		expect( screen.getByRole( 'radio', { name: 'Page' } ) ).toBeVisible();
		rerender( <BuildWowStreamCanvas stream={ withPages( [ 'home', 'about' ] ) } /> );
		expect( screen.getByRole( 'radio', { name: 'Pages' } ) ).toBeVisible();
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

		await user.click( screen.getByRole( 'radio', { name: 'Pages' } ) );
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
		screen.getByRole( 'radio', { name: 'Pages' } ).focus();
		await user.keyboard( '{ArrowLeft}' );
		expect( screen.getByRole( 'radio', { name: 'Design' } ) ).toBeChecked();
		expect( screen.getByRole( 'radio', { name: 'Design' } ) ).toHaveFocus();
		await user.keyboard( '{ArrowRight}' );
		expect( screen.getByRole( 'radio', { name: 'Pages' } ) ).toBeChecked();
		expect( screen.getByRole( 'radio', { name: 'Pages' } ) ).toHaveFocus();
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
		await user.click( screen.getByRole( 'radio', { name: 'Pages' } ) );
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

	it( 'drops a failed image instead of showing a broken tile', () => {
		const { container } = render(
			<BuildWowStreamCanvas
				stream={ imageStream(
					{ 'a.png': { status: 'failed', url: null, query: 'Image 1', aspectRatio: null } },
					3
				) }
			/>
		);
		expect( screen.getByText( '0 of 2 ready' ) ).toBeVisible();
		expect( container.querySelectorAll( '.site-generation-canvas__image' ) ).toHaveLength( 2 );
	} );

	it( 'caps the strip but still counts every image', () => {
		const { container } = render( <BuildWowStreamCanvas stream={ imageStream( {}, 12 ) } /> );
		expect( screen.getByText( '0 of 12 ready' ) ).toBeVisible();
		expect( container.querySelectorAll( '.site-generation-canvas__image' ) ).toHaveLength( 8 );
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

	it( 'omits the images when the plan decided on none or the graph has no images', () => {
		const { rerender } = render( <BuildWowStreamCanvas stream={ imageStream( {}, 0 ) } /> );
		expect( screen.queryByRole( 'heading', { name: 'Images' } ) ).not.toBeInTheDocument();
		const plain = streamView( { plan: null } );
		rerender( <BuildWowStreamCanvas stream={ plain } /> );
		expect( screen.queryByRole( 'heading', { name: 'Images' } ) ).not.toBeInTheDocument();
	} );
} );
