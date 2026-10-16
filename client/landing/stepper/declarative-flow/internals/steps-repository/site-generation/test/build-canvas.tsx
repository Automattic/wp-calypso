/** @jest-environment jsdom */

import { act, render, screen } from '@testing-library/react';
import { BuildWowStreamCanvas } from '../stream/build-canvas';
import { initialStreamState } from '../stream/reducer';
import type { BuildWowStreamView } from '../stream/use-build-wow-stream';

type PreviewProps = {
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

it( 'keeps the preview mounted after handoff without navigation controls', () => {
	render( <BuildWowStreamCanvas stream={ streamView() } /> );
	expect( screen.queryByRole( 'button' ) ).not.toBeInTheDocument();
	act( () => previewProps.current?.onHomeReady?.( true ) );
	act( () => previewProps.current?.onHomeReady?.( false ) );
	act( () => previewProps.current?.onHomeReady?.( true ) );
	expect( screen.queryByRole( 'button' ) ).not.toBeInTheDocument();
	expect( screen.getByTestId( 'html-preview' ).parentElement ).not.toHaveAttribute( 'inert' );
	expect( screen.queryByRole( 'heading', { name: 'Mamma Mia' } ) ).not.toBeInTheDocument();
	expect( previewProps.mounts ).toBe( 1 );
} );

it( 'waits for the first usable preview before offering navigation', () => {
	const { rerender } = render( <BuildWowStreamCanvas stream={ streamView( { previews: {} } ) } /> );
	expect( screen.queryByRole( 'button' ) ).not.toBeInTheDocument();
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
