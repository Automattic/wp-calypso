/**
 * @jest-environment jsdom
 */
import { createCallback } from '../create-callback';
import type { ShowComponentDeps, ShowComponentInput } from '../create-callback';

const mockZoomOut = jest.fn();
jest.mock( '../../../utils/canvas-zoom', () => ( {
	zoomOut: ( ...args: unknown[] ) => mockZoomOut( ...args ),
} ) );

const makeDeps = ( overrides: Partial< ShowComponentDeps > = {} ): ShowComponentDeps => ( {
	currentPostId: 42,
	checkpoint: {
		setCheckpoint: jest.fn(),
	},
	isBuildingSite: false,
	...overrides,
} );

const makeInput = ( overrides: Partial< ShowComponentInput > = {} ): ShowComponentInput => ( {
	type: 'color-picker',
	props: { variations: [ { title: 'Bold' } ] },
	...overrides,
} );

beforeEach( () => jest.clearAllMocks() );

describe( 'show-component/create-callback', () => {
	it( 'returns a successful `agentMessage` with correct structure', async () => {
		const deps = makeDeps();
		const result = await createCallback( deps )( makeInput() );

		expect( result.result ).toEqual( {
			success: true,
			message: 'Choose from the options I provided.',
			details: { type: 'color-picker' },
		} );
		expect( result.returnToAgent ).toBe( true );

		const parsed = JSON.parse( result.agentMessage! );
		expect( parsed.tool_id ).toBe( 'big_sky__show_component' );
		expect( parsed.data ).toMatchObject( {
			type: 'color-picker',
			props: { variations: [ { title: 'Bold' } ] },
			summary: 'Choose from the options I provided.',
			isCurrent: true,
			postId: 42,
		} );
	} );

	it( 'uses the input `summary` as the success message and picker summary', async () => {
		const result = await createCallback( makeDeps() )(
			makeInput( { summary: 'Pick a color palette.' } )
		);

		expect( result.result.message ).toBe( 'Pick a color palette.' );
		expect( JSON.parse( result.agentMessage! ).data.summary ).toBe( 'Pick a color palette.' );
	} );

	it( 'includes `followUpTasks` and `messageId` in the output', async () => {
		const deps = makeDeps();
		const result = await createCallback( deps )(
			makeInput( { followUpTasks: true, messageId: 'msg-1' } )
		);

		const parsed = JSON.parse( result.agentMessage! );
		expect( parsed.data.followUpTasks ).toBe( true );
		expect( parsed.data.calypsoCheckpointId ).toBe( 'msg-1' );
	} );

	it( 'prefers `toolCallId` over `messageId` as the checkpoint ID', async () => {
		const deps = makeDeps();
		const result = await createCallback( deps )(
			makeInput( { toolCallId: 'toolu_1', messageId: 'msg-1' } )
		);

		expect( deps.checkpoint.setCheckpoint ).toHaveBeenCalledWith( 'toolu_1', [ 'color' ] );
		expect( JSON.parse( result.agentMessage! ).data.calypsoCheckpointId ).toBe( 'toolu_1' );
	} );

	it( 'calls `zoomOut` when `shouldZoomOut` is true', async () => {
		const deps = makeDeps( { isBuildingSite: true } );
		await createCallback( deps )( makeInput( { type: 'button-picker', zoomOut: true } ) );

		expect( mockZoomOut ).toHaveBeenCalledWith( { blockDoubleClick: true } );
	} );

	it.each( [ 'color-picker', 'font-picker' ] as const )(
		'skips auto-zoom for %s',
		async ( type ) => {
			await createCallback( makeDeps() )( makeInput( { type, zoomOut: true } ) );
			expect( mockZoomOut ).not.toHaveBeenCalled();
		}
	);

	it( 'does not call `zoomOut` by default', async () => {
		await createCallback( makeDeps() )( makeInput( { type: 'button-picker' } ) );
		expect( mockZoomOut ).not.toHaveBeenCalled();
	} );

	it( 'sets checkpoint with the correct key for each picker type', async () => {
		const deps = makeDeps();

		for ( const [ type, expectedKey ] of [
			[ 'color-picker', 'color' ],
			[ 'font-picker', 'font' ],
			[ 'button-picker', 'button' ],
		] as const ) {
			jest.clearAllMocks();
			await createCallback( deps )( makeInput( { type, messageId: 'msg-1' } ) );
			expect( deps.checkpoint.setCheckpoint ).toHaveBeenCalledWith( 'msg-1', [ expectedKey ] );
		}
	} );

	it( 'does not set checkpoint when no checkpoint ID is available', async () => {
		const deps = makeDeps();
		await createCallback( deps )( makeInput() );
		expect( deps.checkpoint.setCheckpoint ).not.toHaveBeenCalled();
	} );

	it( 'returns a structured error result when props is empty', async () => {
		const result = await createCallback( makeDeps() )( makeInput( { props: {} } ) );

		expect( result.result.success ).toBe( false );
		expect( result.result.message ).toBe(
			'There was an error with this request. Please try again.'
		);
		expect( result.result.error ).toContain( 'Props must be an object with properties' );
		expect( result.returnToAgent ).toBe( true );
		expect( result.agentMessage ).toBeUndefined();
	} );
} );
