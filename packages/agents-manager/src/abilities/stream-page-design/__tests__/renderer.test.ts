jest.mock( '@wordpress/blocks', () => {
	let nextId = 0;

	return {
		createBlock: jest.fn( ( name, attributes = {}, innerBlocks = [] ) => ( {
			clientId: `preview-${ ++nextId }`,
			name,
			attributes,
			innerBlocks,
		} ) ),
		getBlockType: jest.fn(),
		parse: jest.fn(),
		serialize: jest.fn(),
		validateBlock: jest.fn(),
	};
} );
// The scanner stays real; only the editor-side repair is stubbed.
jest.mock( '../block-markup', () => {
	let nextId = 0;

	return {
		...jest.requireActual( '../block-markup' ),
		repairBlocksFromMarkup: jest.fn( ( markup: string ) => [
			{
				clientId: `final-${ ++nextId }`,
				name: 'core/paragraph',
				attributes: { markup },
				innerBlocks: [],
			},
		] ),
	};
} );
jest.mock( '../preview', () => ( {
	...jest.requireActual( '../preview' ),
	ensurePreviewStyles: jest.fn(),
	scrollToBlockBottom: jest.fn(),
} ) );

import { act, renderHook } from '@testing-library/react';
import { ensurePreviewStyles, PREVIEW_CLASS_NAME, scrollToBlockBottom } from '../preview';
import { usePageDesignRenderer, type EditorHost } from '../renderer';
import {
	finalizePendingStreams,
	handlePageDesignTaskUpdate,
	setStreamHandler,
	STREAM_PAGE_DESIGN_TOOL_ID,
} from '../stream';
import type { TaskUpdate } from '@automattic/agenttic-client';

const PAGE = '<!-- wpcom:page-design-section {"target":"page"} -->';
const PARAGRAPH = '<!-- wp:paragraph --><p>Hi</p><!-- /wp:paragraph -->';

const streamed = ( markup: string, toolCallId = 'call-1' ) =>
	handlePageDesignTaskUpdate( {
		status: {
			message: {
				parts: [
					{
						type: 'data',
						data: { toolId: STREAM_PAGE_DESIGN_TOOL_ID, toolCallId, arguments: { markup } },
					},
				],
			},
		},
	} as unknown as TaskUpdate );

const flush = () => act( () => jest.advanceTimersByTime( 150 ) );

let host: jest.Mocked< EditorHost >;

const lastStaged = () => host.stageBlocks.mock.calls[ host.stageBlocks.mock.calls.length - 1 ];

beforeEach( () => {
	jest.useFakeTimers();
	jest.clearAllMocks();
	host = {
		resolveRoot: jest.fn( () => 'root' ),
		stageBlocks: jest.fn(),
		captureCheckpoint: jest.fn(),
		commitFinalDesign: jest.fn(),
	};
} );

afterEach( () => {
	setStreamHandler( undefined );
	jest.useRealTimers();
} );

it( 'paints a complete block after the throttle, snapshotting the page first', async () => {
	renderHook( () => usePageDesignRenderer( host ) );

	await streamed( `${ PAGE }${ PARAGRAPH }` );

	expect( host.stageBlocks ).not.toHaveBeenCalled();

	flush();

	expect( host.captureCheckpoint ).toHaveBeenCalledWith( 'call-1', 'root' );
	expect( host.stageBlocks ).toHaveBeenCalledWith( 'root', [
		expect.objectContaining( { name: 'core/paragraph', attributes: { markup: PARAGRAPH } } ),
	] );
	expect( host.captureCheckpoint.mock.invocationCallOrder[ 0 ] ).toBeLessThan(
		host.stageBlocks.mock.invocationCallOrder[ 0 ]
	);
	expect( scrollToBlockBottom ).toHaveBeenCalledWith( 'final-1' );
} );

it( 'paints a burst of deltas in one flush', async () => {
	renderHook( () => usePageDesignRenderer( host ) );

	await streamed( `${ PAGE }<!-- wp:para` );
	await streamed( `${ PAGE }${ PARAGRAPH }<!-- wp:para` );
	await streamed( `${ PAGE }${ PARAGRAPH }${ PARAGRAPH }` );
	flush();

	expect( host.resolveRoot ).toHaveBeenCalledTimes( 1 );
	expect( lastStaged()[ 1 ] ).toHaveLength( 2 );
} );

it( 'shows an open block as a preview, then replaces it when it closes', async () => {
	renderHook( () => usePageDesignRenderer( host ) );

	await streamed( `${ PAGE }<!-- wp:group --><div>` );
	flush();

	const [ , [ preview ] ] = host.stageBlocks.mock.calls[ 0 ];
	expect( preview ).toEqual(
		expect.objectContaining( { name: 'core/group', attributes: { className: PREVIEW_CLASS_NAME } } )
	);

	await streamed( `${ PAGE }<!-- wp:group --><div>${ PARAGRAPH }</div><!-- /wp:group -->` );
	flush();

	const [ , staged ] = lastStaged();
	expect( staged ).toHaveLength( 1 );
	expect( staged[ 0 ].attributes ).not.toHaveProperty( 'className' );
} );

it( 'places complete children under an open block, and previews an open child', async () => {
	renderHook( () => usePageDesignRenderer( host ) );

	await streamed( `${ PAGE }<!-- wp:group --><div>${ PARAGRAPH }<!-- wp:columns --><div>` );
	flush();

	const [ , [ preview ] ] = host.stageBlocks.mock.calls[ 0 ];
	const [ rootClientId, children ] = lastStaged();
	expect( rootClientId ).toBe( preview.clientId );
	expect( children.map( ( block ) => block.name ) ).toEqual( [ 'core/paragraph', 'core/columns' ] );
	expect( children[ 1 ].attributes ).toEqual( { className: PREVIEW_CLASS_NAME } );
} );

it( 'waits for a block to open before previewing wrapper HTML at the top level', async () => {
	renderHook( () => usePageDesignRenderer( host ) );

	await streamed( `${ PAGE }<div><!-- wp:group -->` );
	flush();

	expect( host.stageBlocks ).not.toHaveBeenCalled();
} );

it( 'commits at once on the final flush', async () => {
	renderHook( () => usePageDesignRenderer( host ) );

	await streamed( `${ PAGE }${ PARAGRAPH }` );
	await act( () => finalizePendingStreams() );

	expect( host.stageBlocks ).toHaveBeenCalled();
	expect( host.commitFinalDesign ).toHaveBeenCalledWith( 'call-1', 'root' );
} );

it( 'keeps the preview styles injected while a design streams', async () => {
	renderHook( () => usePageDesignRenderer( host ) );

	await streamed( `${ PAGE }<!-- wp:group -->` );
	act( () => jest.advanceTimersByTime( 2000 ) );

	expect( ensurePreviewStyles ).toHaveBeenCalledTimes( 3 );

	await act( () => finalizePendingStreams() );
	act( () => jest.advanceTimersByTime( 2000 ) );

	expect( ensurePreviewStyles ).toHaveBeenCalledTimes( 3 );
} );

// The canvas can still be mounting when the first markup arrives.
describe( 'without a root', () => {
	it( 'retries until the canvas has one', async () => {
		host.resolveRoot.mockReturnValueOnce( null );
		renderHook( () => usePageDesignRenderer( host ) );

		await streamed( `${ PAGE }${ PARAGRAPH }` );
		flush();

		expect( host.stageBlocks ).not.toHaveBeenCalled();

		flush();

		expect( host.stageBlocks ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'gives up after the retry budget', async () => {
		host.resolveRoot.mockReturnValue( null );
		renderHook( () => usePageDesignRenderer( host ) );

		await streamed( `${ PAGE }${ PARAGRAPH }` );
		act( () => jest.advanceTimersByTime( 150 * 30 ) );

		expect( host.resolveRoot ).toHaveBeenCalledTimes( 21 );
		expect( jest.getTimerCount() ).toBe( 1 );
	} );

	// A retry queued before the canvas mounted must not fire after the final
	// flush landed: it would snapshot the finished design as the checkpoint.
	it( 'drops a queued retry once a flush lands', async () => {
		host.resolveRoot.mockReturnValueOnce( null );
		renderHook( () => usePageDesignRenderer( host ) );

		await streamed( `${ PAGE }${ PARAGRAPH }` );
		flush();
		await act( () => finalizePendingStreams() );
		act( () => jest.advanceTimersByTime( 150 * 5 ) );

		expect( host.commitFinalDesign ).toHaveBeenCalledTimes( 1 );
		expect( host.captureCheckpoint ).toHaveBeenCalledTimes( 1 );
		expect( jest.getTimerCount() ).toBe( 0 );
	} );

	it( 'still commits a final flush that had to wait', async () => {
		host.resolveRoot.mockReturnValueOnce( null );
		renderHook( () => usePageDesignRenderer( host ) );

		await streamed( `${ PAGE }${ PARAGRAPH }` );
		await act( () => finalizePendingStreams() );

		expect( host.commitFinalDesign ).not.toHaveBeenCalled();

		flush();

		expect( host.commitFinalDesign ).toHaveBeenCalledWith( 'call-1', 'root' );
	} );
} );

it( 'stops listening and clears its timers when unmounted', async () => {
	const { unmount } = renderHook( () => usePageDesignRenderer( host ) );

	await streamed( `${ PAGE }<!-- wp:group -->` );
	unmount();

	expect( jest.getTimerCount() ).toBe( 0 );

	await streamed( `${ PAGE }${ PARAGRAPH }` );
	flush();

	expect( host.stageBlocks ).not.toHaveBeenCalled();
} );
