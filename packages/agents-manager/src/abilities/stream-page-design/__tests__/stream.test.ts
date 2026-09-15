import {
	extractPartialJsonStringProperty,
	finalizePendingStreams,
	getMarkupFromArguments,
	getPageSectionMarkup,
	getStreamedMarkup,
	handlePageDesignTaskUpdate,
	PAGE_DESIGN_STREAM_STARTED_EVENT,
	setStreamHandler,
	STREAM_PAGE_DESIGN_TOOL_ID,
	withPageDesignStream,
} from '../stream';
import type { Part, TaskUpdate } from '@automattic/agenttic-client';

const streamPart = ( toolCallId: string, args: unknown ): Part =>
	( {
		type: 'data',
		data: { toolId: STREAM_PAGE_DESIGN_TOOL_ID, toolCallId, arguments: args },
	} ) as Part;

const update = ( parts: Part[], sessionId?: string ): TaskUpdate =>
	( { sessionId, status: { message: { parts } } } ) as TaskUpdate;

const streamed = ( toolCallId: string, markup: string, sessionId?: string ) =>
	handlePageDesignTaskUpdate( update( [ streamPart( toolCallId, { markup } ) ], sessionId ) );

let handler: jest.Mock;

beforeEach( () => {
	handler = jest.fn();
	setStreamHandler( handler );
} );

// Unregistering forgets every stream, so each test starts from nothing.
afterEach( () => setStreamHandler( undefined ) );

describe( 'extractPartialJsonStringProperty', () => {
	it.each( [
		{
			case: 'a complete value',
			json: '{"markup":"<p>Hi</p>","summary":"x"}',
			expected: '<p>Hi</p>',
		},
		{ case: 'a value still streaming', json: '{"markup":"<p>Hi', expected: '<p>Hi' },
		{ case: 'spaces around the colon', json: '{ "markup" : "a" }', expected: 'a' },
		{
			case: 'escaped characters',
			json: '{"markup":"a\\nb\\"c\\\\d\\/e"}',
			expected: 'a\nb"c\\d/e',
		},
		{ case: 'a unicode escape', json: '{"markup":"\\u0041"}', expected: 'A' },
		{ case: 'an escape cut off by the end', json: '{"markup":"ab\\', expected: 'ab' },
		{ case: 'a unicode escape cut off by the end', json: '{"markup":"ab\\u00', expected: 'ab' },
	] )( 'reads $case', ( { json, expected } ) => {
		expect( extractPartialJsonStringProperty( json, 'markup' ) ).toBe( expected );
	} );

	it( 'is null when the property is absent', () => {
		expect( extractPartialJsonStringProperty( '{"summary":"x"}', 'markup' ) ).toBeNull();
	} );
} );

describe( 'getMarkupFromArguments', () => {
	it.each( [
		{ case: 'parsed arguments', args: { markup: '<p>a</p>' }, expected: '<p>a</p>' },
		{ case: 'raw JSON still streaming', args: { _raw: '{"markup":"<p>a' }, expected: '<p>a' },
		{ case: 'raw JSON with no markup yet', args: { _raw: '{"sum' }, expected: null },
		{ case: 'no arguments', args: undefined, expected: null },
	] )( 'reads $case', ( { args, expected } ) => {
		expect( getMarkupFromArguments( args ) ).toBe( expected );
	} );
} );

describe( 'getPageSectionMarkup', () => {
	const open = ( target: string ) => `<!-- wpcom:page-design-section {"target":"${ target }"} -->`;
	const close = '<!-- /wpcom:page-design-section -->';

	it.each( [
		{ case: 'a closed section', markup: `${ open( 'page' ) }A${ close }`, expected: 'A' },
		{
			case: 'an open section, to the end',
			markup: `${ open( 'page' ) }A<!-- wp:para`,
			expected: 'A<!-- wp:para',
		},
		{
			case: 'closed sections joined, and an open one up to the next section',
			markup: `${ open( 'page' ) }A${ close }${ open( 'page' ) }B${ open( 'style' ) }`,
			expected: 'A\nB',
		},
		{
			case: 'other targets left out',
			markup: `${ open( 'style' ) }.a{}${ close }`,
			expected: null,
		},
		{ case: 'nothing before the first section', markup: '<!-- wp:paragraph -->', expected: null },
		{
			case: 'a closing delimiter still streaming, dropped',
			markup: `${ open( 'page' ) }A<!-- /wpcom:page-`,
			expected: 'A',
		},
		{
			case: 'a delimiter whose JSON holds a brace',
			markup: `<!-- wpcom:page-design-section {"target":"page","note":"}"} -->A${ close }`,
			expected: 'A',
		},
	] )( 'reads $case', ( { markup, expected } ) => {
		expect( getPageSectionMarkup( markup ) ).toBe( expected );
	} );
} );

describe( 'handlePageDesignTaskUpdate', () => {
	it( 'keeps the markup streamed so far and tells the renderer each time', async () => {
		await streamed( 'call-1', '<p>a' );
		await streamed( 'call-1', '<p>ab' );

		expect( handler ).toHaveBeenCalledTimes( 2 );
		expect( handler ).toHaveBeenLastCalledWith( { toolCallId: 'call-1' } );
		expect( getStreamedMarkup( 'call-1' ) ).toBe( '<p>ab' );
	} );

	it( 'skips an update that adds nothing', async () => {
		await streamed( 'call-1', '<p>a' );
		await streamed( 'call-1', '<p>a' );

		expect( handler ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'ignores parts of other kinds and tools, and one with no markup yet', async () => {
		await handlePageDesignTaskUpdate(
			update( [
				{ type: 'text', text: 'hi' } as Part,
				{
					type: 'data',
					data: { toolId: 'other', toolCallId: 'call-1', arguments: { markup: 'x' } },
				} as Part,
				{
					type: 'data',
					data: { toolId: STREAM_PAGE_DESIGN_TOOL_ID, arguments: { markup: 'x' } },
				} as Part,
				streamPart( 'call-2', { _raw: '{"sum' } ),
			] )
		);

		expect( handler ).not.toHaveBeenCalled();
	} );

	// The listener has to uncover the editor before the first frame lands.
	it( 'announces the start of each tool call once, before the first frame', async () => {
		const order: string[] = [];
		const listener = jest.fn< void, [ Event ] >( () => {
			order.push( 'announced' );
		} );
		handler.mockImplementation( () => order.push( 'frame' ) );
		window.addEventListener( PAGE_DESIGN_STREAM_STARTED_EVENT, listener );

		await streamed( 'call-1', '<p>a' );
		await streamed( 'call-1', '<p>ab' );

		expect( order ).toEqual( [ 'announced', 'frame', 'frame' ] );
		expect( ( listener.mock.calls[ 0 ][ 0 ] as CustomEvent ).detail ).toEqual( {
			toolCallId: 'call-1',
		} );
		window.removeEventListener( PAGE_DESIGN_STREAM_STARTED_EVENT, listener );
	} );

	it( 'forgets a previous session when a new one streams', async () => {
		setStreamHandler( undefined );
		await streamed( 'call-1', '<p>a', 'session-1' );
		await streamed( 'call-2', '<p>b', 'session-2' );

		setStreamHandler( handler );
		await Promise.resolve();

		expect( handler ).toHaveBeenCalledTimes( 1 );
		expect( handler ).toHaveBeenCalledWith( { toolCallId: 'call-2' } );
	} );

	it( 'announces a tool call again once its session was forgotten', async () => {
		const listener = jest.fn();
		window.addEventListener( PAGE_DESIGN_STREAM_STARTED_EVENT, listener );

		await streamed( 'call-1', '<p>a', 'session-1' );
		await streamed( 'call-1', '<p>a', 'session-2' );

		expect( listener ).toHaveBeenCalledTimes( 2 );
		window.removeEventListener( PAGE_DESIGN_STREAM_STARTED_EVENT, listener );
	} );
} );

describe( 'setStreamHandler', () => {
	// The canvas mounts after the chat, so the renderer can arrive mid-stream.
	it( 'tells a renderer that registers late about each stream', async () => {
		setStreamHandler( undefined );
		await streamed( 'call-1', '<p>a' );
		await streamed( 'call-1', '<p>ab' );

		setStreamHandler( handler );
		await Promise.resolve();

		expect( handler ).toHaveBeenCalledTimes( 1 );
		expect( handler ).toHaveBeenCalledWith( { toolCallId: 'call-1' } );
		expect( getStreamedMarkup( 'call-1' ) ).toBe( '<p>ab' );
	} );

	it( 'finalizes, for a renderer that registers late, a stream already finalized', async () => {
		setStreamHandler( undefined );
		await streamed( 'call-1', '<p>a' );
		await finalizePendingStreams( 'call-1' );

		setStreamHandler( handler );
		await Promise.resolve();

		expect( handler ).toHaveBeenCalledTimes( 1 );
		expect( handler ).toHaveBeenCalledWith( { toolCallId: 'call-1', isFinal: true } );

		await finalizePendingStreams();

		expect( handler ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'forgets the stream when the renderer unregisters', async () => {
		await streamed( 'call-1', '<p>a' );
		handler.mockClear();

		setStreamHandler( undefined );
		setStreamHandler( handler );
		await Promise.resolve();

		expect( handler ).not.toHaveBeenCalled();
		expect( getStreamedMarkup( 'call-1' ) ).toBeUndefined();
	} );
} );

describe( 'finalizePendingStreams', () => {
	it( 'finalizes each tool call that streamed, once', async () => {
		await streamed( 'call-1', '<p>a' );
		await streamed( 'call-2', '<p>b' );
		handler.mockClear();

		await finalizePendingStreams();
		await finalizePendingStreams();

		expect( handler.mock.calls.map( ( [ call ] ) => call ) ).toEqual( [
			{ toolCallId: 'call-1', isFinal: true },
			{ toolCallId: 'call-2', isFinal: true },
		] );
	} );

	it( 'finalizes only the tool call that completed when it is known', async () => {
		await streamed( 'call-1', '<p>a' );
		await streamed( 'call-2', '<p>b' );
		handler.mockClear();

		await finalizePendingStreams( 'call-2' );

		expect( handler ).toHaveBeenCalledTimes( 1 );
		expect( handler ).toHaveBeenCalledWith( { toolCallId: 'call-2', isFinal: true } );
	} );

	// The design is on the canvas already; failing the round trip would hang the agent.
	it( 'logs a renderer that fails to finalize and goes on', async () => {
		const consoleError = jest.spyOn( console, 'error' ).mockImplementation( () => {} );
		await streamed( 'call-1', '<p>a' );
		await streamed( 'call-2', '<p>b' );
		handler.mockImplementationOnce( () => {
			throw new Error( 'canvas gone' );
		} );

		await expect( finalizePendingStreams() ).resolves.toBeUndefined();

		expect( handler ).toHaveBeenLastCalledWith( { toolCallId: 'call-2', isFinal: true } );
		expect( consoleError ).toHaveBeenCalledWith(
			'[AgentsManager] The page design could not be finalized:',
			expect.any( Error )
		);
		consoleError.mockRestore();
	} );
} );

describe( 'withPageDesignStream', () => {
	const text = { type: 'text', text: 'hi' } as Part;

	it( 'handles the stream and keeps its parts from the next callback', async () => {
		const next = jest.fn();

		await withPageDesignStream( next )(
			update( [ text, streamPart( 'call-1', { markup: '<p>a' } ) ] )
		);

		expect( handler ).toHaveBeenCalledWith( { toolCallId: 'call-1' } );
		expect( next ).toHaveBeenCalledWith( update( [ text ] ) );
	} );

	it( 'passes an update with no stream on untouched', async () => {
		const next = jest.fn();
		const plain = update( [ text ] );

		await withPageDesignStream( next )( plain );

		expect( next.mock.calls[ 0 ][ 0 ] ).toBe( plain );
	} );

	it( 'handles the stream with no next callback', async () => {
		await withPageDesignStream( undefined )(
			update( [ streamPart( 'call-1', { markup: '<p>a' } ) ] )
		);

		expect( handler ).toHaveBeenCalled();
	} );
} );
