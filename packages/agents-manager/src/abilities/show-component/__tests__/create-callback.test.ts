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
	getClientIdMap: () => ( {} ),
	checkpoint: {
		setCheckpoint: jest.fn(),
		addNewPageToCheckpoint: jest.fn(),
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

		expect( result.result ).toBe( 'Component displayed successfully' );
		expect( result.returnToAgent ).toBe( false );

		const parsed = JSON.parse( result.agentMessage! );
		expect( parsed.tool_id ).toBe( 'big_sky__show_component' );
		expect( parsed.data ).toMatchObject( {
			type: 'color-picker',
			props: { variations: [ { title: 'Bold' } ] },
			isCurrent: true,
			postId: 42,
		} );
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

	it( 'resolves compressed `clientId` from the map', async () => {
		const deps = makeDeps( {
			getClientIdMap: () => ( { abc123: 'real-block-id-456' } ),
		} );
		const result = await createCallback( deps )( makeInput( { clientId: 'abc123' } ) );

		const parsed = JSON.parse( result.agentMessage! );
		expect( parsed.data.props.clientId ).toBe( 'real-block-id-456' );
	} );

	it( 'does not set `clientId` when compressed ID is not in the map', async () => {
		const deps = makeDeps( {
			getClientIdMap: () => ( { abc123: 'real-id' } ),
		} );
		const result = await createCallback( deps )( makeInput( { clientId: 'unknown' } ) );

		const parsed = JSON.parse( result.agentMessage! );
		expect( parsed.data.props.clientId ).toBeUndefined();
	} );

	it( 'attaches `insertIndex` to props when provided', async () => {
		const deps = makeDeps();
		const result = await createCallback( deps )( makeInput( { insertIndex: 3 } ) );

		const parsed = JSON.parse( result.agentMessage! );
		expect( parsed.data.props.insertIndex ).toBe( 3 );
	} );

	it( 'calls `zoomOut` when `shouldZoomOut` is true', async () => {
		const deps = makeDeps( { isBuildingSite: true } );
		await createCallback( deps )( makeInput( { zoomOut: true } ) );

		expect( mockZoomOut ).toHaveBeenCalledWith( { blockDoubleClick: true } );
	} );

	it( 'does not call `zoomOut` by default', async () => {
		await createCallback( makeDeps() )( makeInput() );
		expect( mockZoomOut ).not.toHaveBeenCalled();
	} );

	it( 'sets checkpoint with the correct key for each picker type', async () => {
		const deps = makeDeps();

		for ( const [ type, expectedKey ] of [
			[ 'color-picker', 'color' ],
			[ 'font-picker', 'font' ],
			[ 'button-picker', 'button' ],
			[ 'pattern-picker', 'blocks' ],
		] as const ) {
			jest.clearAllMocks();
			await createCallback( deps )( makeInput( { type, messageId: 'msg-1' } ) );
			expect( deps.checkpoint.setCheckpoint ).toHaveBeenCalledWith( 'msg-1', [ expectedKey ] );
		}
	} );

	it( 'does not set checkpoint when `messageId` is absent', async () => {
		const deps = makeDeps();
		await createCallback( deps )( makeInput() );
		expect( deps.checkpoint.setCheckpoint ).not.toHaveBeenCalled();
	} );

	it( 'uses "page" checkpoint key and adds new page for `pattern-picker` with `newPageId`', async () => {
		const deps = makeDeps();
		await createCallback( deps )(
			makeInput( {
				type: 'pattern-picker',
				props: { layouts: [], newPageId: 'page-99' },
				messageId: 'msg-2',
			} )
		);

		expect( deps.checkpoint.setCheckpoint ).toHaveBeenCalledWith( 'msg-2', [ 'page' ] );
		expect( deps.checkpoint.addNewPageToCheckpoint ).toHaveBeenCalledWith( 'page-99' );
	} );

	it( 'returns error result when props is empty', async () => {
		const result = await createCallback( makeDeps() )( makeInput( { props: {} } ) );

		expect( result.result ).toBe( 'There was an error with this request.' );
		expect( result.agentMessage ).toBeUndefined();
	} );

	it( 'sets `returnToAgent` based on `followUpTasks` on error', async () => {
		const resultWithFollowUp = await createCallback( makeDeps() )(
			makeInput( { props: {}, followUpTasks: true } )
		);
		expect( resultWithFollowUp.returnToAgent ).toBe( true );

		const resultWithout = await createCallback( makeDeps() )( makeInput( { props: {} } ) );
		expect( resultWithout.returnToAgent ).toBe( false );
	} );

	it( 'does not mutate the input props object', async () => {
		const inputProps = { variations: [] };
		await createCallback( makeDeps() )(
			makeInput( { props: inputProps, insertIndex: 5, clientId: 'x' } )
		);

		expect( inputProps ).toEqual( { variations: [] } );
	} );
} );
