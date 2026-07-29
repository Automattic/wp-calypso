jest.mock( '@wordpress/core-data', () => ( { store: 'core' } ) );
jest.mock( '@wordpress/data', () => ( {
	select: jest.fn(),
	dispatch: jest.fn(),
} ) );

const GLOBAL_STYLES_RECORD = {
	settings: { color: { palette: [ { slug: 'primary', color: '#111111' } ] } },
	styles: { typography: { fontSize: '16px' } },
};

// The record store is module state — each test loads a fresh module (and the
// matching mock instances) to start clean.
async function loadCheckpoints() {
	jest.resetModules();
	const { select, dispatch } = jest.requireMock( '@wordpress/data' );
	const getGlobalStylesId = jest.fn().mockReturnValue( 'global-styles-1' );
	const getEditedEntityRecord = jest.fn().mockReturnValue( GLOBAL_STYLES_RECORD );
	const editEntityRecord = jest.fn();
	select.mockReturnValue( {
		__experimentalGetCurrentGlobalStylesId: getGlobalStylesId,
		getEditedEntityRecord,
	} );
	dispatch.mockReturnValue( { editEntityRecord } );
	const checkpoints = await import( '../checkpoints' );
	return { ...checkpoints, getGlobalStylesId, getEditedEntityRecord, editEntityRecord };
}

beforeEach( () => jest.clearAllMocks() );

describe( 'setCheckpoint', () => {
	it( 'captures the global-styles snapshot with keys and metadata', async () => {
		const { setCheckpoint, getCheckpoints, checkpointKeys } = await loadCheckpoints();

		setCheckpoint( 'toolu_1', [ checkpointKeys.COLOR ], {
			toolId: 'big_sky__set_styles',
			summary: 'Applied the Vibrant palette.',
		} );

		expect( getCheckpoints() ).toEqual( [
			{
				id: 'toolu_1',
				checkpointKeys: [ 'color' ],
				toolId: 'big_sky__set_styles',
				summary: 'Applied the Vibrant palette.',
				themeBeforeUpdate: GLOBAL_STYLES_RECORD,
			},
		] );
	} );

	it( 'snapshots by value, not by reference to the edited record', async () => {
		const { setCheckpoint, getCheckpoints, getEditedEntityRecord } = await loadCheckpoints();
		const liveRecord: { settings: Record< string, unknown >; styles: object } = {
			settings: { color: {} },
			styles: {},
		};
		getEditedEntityRecord.mockReturnValue( liveRecord );

		setCheckpoint( 'toolu_1', [] );
		liveRecord.settings.color = { palette: [ 'mutated' ] };

		expect( getCheckpoints()[ 0 ].themeBeforeUpdate?.settings ).toEqual( { color: {} } );
	} );

	it( 'is a no-op without an id', async () => {
		const { setCheckpoint, getCheckpoints } = await loadCheckpoints();

		setCheckpoint( '', [] );

		expect( getCheckpoints() ).toEqual( [] );
	} );

	it( 'stores the checkpoint without a snapshot when there is no global-styles id', async () => {
		const { setCheckpoint, getCheckpoints, getGlobalStylesId } = await loadCheckpoints();
		getGlobalStylesId.mockReturnValue( undefined );

		setCheckpoint( 'toolu_1', [] );

		expect( getCheckpoints() ).toEqual( [ { id: 'toolu_1', checkpointKeys: [] } ] );
	} );

	it( 'stores the checkpoint without a snapshot when there is no edited record', async () => {
		const { setCheckpoint, getCheckpoints, getEditedEntityRecord } = await loadCheckpoints();
		getEditedEntityRecord.mockReturnValue( undefined );

		setCheckpoint( 'toolu_1', [] );

		expect( getCheckpoints() ).toEqual( [ { id: 'toolu_1', checkpointKeys: [] } ] );
	} );

	it( 'overwrites an existing checkpoint in place', async () => {
		const { setCheckpoint, getCheckpoints, checkpointKeys } = await loadCheckpoints();
		setCheckpoint( 'toolu_1', [ checkpointKeys.COLOR ], { summary: 'First.' } );
		setCheckpoint( 'toolu_2', [ checkpointKeys.FONT ] );
		setCheckpoint( 'toolu_1', [ checkpointKeys.BUTTON ], { summary: 'Second.' } );

		expect(
			getCheckpoints().map( ( { id, checkpointKeys: keys, summary } ) => ( { id, keys, summary } ) )
		).toEqual( [
			{ id: 'toolu_1', keys: [ 'button' ], summary: 'Second.' },
			{ id: 'toolu_2', keys: [ 'font' ], summary: undefined },
		] );
	} );
} );

describe( 'hasCheckpoint / clearCheckpoint / getCheckpoints', () => {
	it( 'tracks and clears checkpoints by id, oldest first', async () => {
		const { setCheckpoint, hasCheckpoint, clearCheckpoint, getCheckpoints } =
			await loadCheckpoints();

		setCheckpoint( 'toolu_1', [] );
		setCheckpoint( 'toolu_2', [] );

		expect( hasCheckpoint( 'toolu_1' ) ).toBe( true );
		expect( getCheckpoints().map( ( { id } ) => id ) ).toEqual( [ 'toolu_1', 'toolu_2' ] );

		clearCheckpoint( 'toolu_1' );

		expect( hasCheckpoint( 'toolu_1' ) ).toBe( false );
		expect( getCheckpoints().map( ( { id } ) => id ) ).toEqual( [ 'toolu_2' ] );
	} );
} );

describe( 'getAvailableCheckpoints', () => {
	it( 'returns an empty list without checkpoints', async () => {
		const { getAvailableCheckpoints } = await loadCheckpoints();

		expect( getAvailableCheckpoints() ).toEqual( [] );
	} );

	it( 'lists checkpoint metadata without snapshots and marks the latest per tool', async () => {
		const { setCheckpoint, getAvailableCheckpoints, checkpointKeys } = await loadCheckpoints();
		setCheckpoint( 'toolu_1', [ checkpointKeys.COLOR ], {
			toolCallId: 'toolu_1',
			toolId: 'big_sky__show_component',
			summary: 'Color picker shown.',
		} );
		setCheckpoint( 'toolu_2', [ checkpointKeys.FONT ], { toolId: 'big_sky__show_component' } );
		setCheckpoint( 'toolu_3', [], {
			toolId: 'big_sky__restore_checkpoint',
			requestIntentType: 'redo',
			restoresCheckpointId: 'toolu_1',
		} );

		expect( getAvailableCheckpoints() ).toEqual( [
			{
				checkpointId: 'toolu_1',
				checkpointIndex: 0,
				checkpointKeys: [ 'color' ],
				toolId: 'big_sky__show_component',
				summary: 'Color picker shown.',
				isLatestForTool: false,
			},
			{
				checkpointId: 'toolu_2',
				checkpointIndex: 1,
				checkpointKeys: [ 'font' ],
				toolId: 'big_sky__show_component',
				isLatestForTool: true,
			},
			{
				checkpointId: 'toolu_3',
				checkpointIndex: 2,
				checkpointKeys: [],
				toolId: 'big_sky__restore_checkpoint',
				requestIntentType: 'redo',
				restoresCheckpointId: 'toolu_1',
				isLatestForTool: true,
			},
		] );
	} );
} );

describe( 'restoreCheckpoint', () => {
	it( 'rejects for an unknown checkpoint id', async () => {
		const { restoreCheckpoint } = await loadCheckpoints();

		await expect( restoreCheckpoint( 'missing' ) ).rejects.toThrow(
			'Checkpoint not found: missing'
		);
	} );

	it.each( [ [ 'color' ], [ 'font' ], [ 'button' ] ] )(
		'restores the global-styles snapshot for the `%s` key',
		async ( key ) => {
			const { setCheckpoint, restoreCheckpoint, editEntityRecord } = await loadCheckpoints();
			setCheckpoint( 'toolu_1', [ key ] );

			await restoreCheckpoint( 'toolu_1' );

			expect( editEntityRecord ).toHaveBeenCalledWith(
				'root',
				'globalStyles',
				'global-styles-1',
				GLOBAL_STYLES_RECORD,
				{ undoIgnore: true }
			);
		}
	);

	it( 'skips the global-styles restore when the keys scope another domain', async () => {
		const { setCheckpoint, restoreCheckpoint, editEntityRecord } = await loadCheckpoints();
		setCheckpoint( 'toolu_1', [ 'blocks' ] );

		await restoreCheckpoint( 'toolu_1' );

		expect( editEntityRecord ).not.toHaveBeenCalled();
	} );

	it( 'rejects when the checkpoint has no snapshot', async () => {
		const {
			setCheckpoint,
			restoreCheckpoint,
			editEntityRecord,
			getEditedEntityRecord,
			checkpointKeys,
		} = await loadCheckpoints();
		getEditedEntityRecord.mockReturnValue( undefined );
		setCheckpoint( 'toolu_1', [ checkpointKeys.COLOR ] );

		await expect( restoreCheckpoint( 'toolu_1' ) ).rejects.toThrow(
			'Checkpoint has no global-styles snapshot to restore.'
		);
		expect( editEntityRecord ).not.toHaveBeenCalled();
	} );

	it( 'rejects when the editor data store is gone', async () => {
		const { setCheckpoint, restoreCheckpoint, checkpointKeys } = await loadCheckpoints();
		setCheckpoint( 'toolu_1', [ checkpointKeys.COLOR ] );
		jest.requireMock( '@wordpress/data' ).dispatch.mockReturnValue( undefined );

		await expect( restoreCheckpoint( 'toolu_1' ) ).rejects.toThrow(
			'Global styles are unavailable to restore into.'
		);
	} );

	it( 'rejects when the global-styles id is gone', async () => {
		const {
			setCheckpoint,
			restoreCheckpoint,
			editEntityRecord,
			getGlobalStylesId,
			checkpointKeys,
		} = await loadCheckpoints();
		setCheckpoint( 'toolu_1', [ checkpointKeys.COLOR ] );
		getGlobalStylesId.mockReturnValue( undefined );

		await expect( restoreCheckpoint( 'toolu_1' ) ).rejects.toThrow(
			'Global styles are unavailable to restore into.'
		);
		expect( editEntityRecord ).not.toHaveBeenCalled();
	} );
} );
