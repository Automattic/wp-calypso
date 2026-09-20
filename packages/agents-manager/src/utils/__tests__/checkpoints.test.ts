jest.mock( '@wordpress/core-data', () => ( { store: 'core' } ) );
jest.mock( '../tool-call-history', () => ( {
	getToolCallIdFromConversationHistory: jest.fn( () => 'call-1' ),
} ) );
jest.mock( '@wordpress/data', () => ( {
	select: jest.fn(),
	dispatch: jest.fn(),
	resolveSelect: jest.fn(),
} ) );
jest.mock( '../editor-blocks', () => {
	const getRootBlocks = jest.fn( () => [] );
	const getTemplatePartBlocks = jest.fn( () => [] );

	return {
		findTemplatePartClientId: jest.fn(),
		getBlocks: jest.fn( () => [] ),
		getPageBlocks: jest.fn( () => ( {
			blocks: getRootBlocks(),
			templateParts: getTemplatePartBlocks(),
		} ) ),
		getRootBlocks,
		getTemplatePartBlocks,
		replaceRootBlocks: jest.fn(),
		resolveBlocksRoot: jest.fn( () => ( {
			kind: 'post-content',
			clientId: 'pc',
			post: { id: 7, type: 'page', title: 'About' },
		} ) ),
		stageRootBlocks: jest.fn(),
	};
} );
jest.mock( '../tracks', () => ( { recordBigSkyTracksEvent: jest.fn() } ) );
// Reached through the navigation domain, and it registers a store on import —
// which the mocked `@wordpress/data` above cannot serve.
jest.mock( '@wordpress/blocks', () => ( {
	createBlock: jest.fn(),
	parse: jest.fn( () => [] ),
	serialize: jest.fn( () => '' ),
} ) );

const GLOBAL_STYLES_RECORD = {
	settings: { color: { palette: [ { slug: 'primary', color: '#111111' } ] } },
	styles: { typography: { fontSize: '16px' } },
};

const SITE_RECORD = { site_logo: 42 };

// The record store is module state — each test loads a fresh module (and the
// matching mock instances) to start clean.
async function loadCheckpoints() {
	jest.resetModules();
	const { select, dispatch } = jest.requireMock( '@wordpress/data' );
	const getGlobalStylesId = jest.fn().mockReturnValue( 'global-styles-1' );
	const getEditedEntityRecord = jest.fn(
		( _kind: string, name: string ): Record< string, unknown > | undefined =>
			name === 'site' ? SITE_RECORD : GLOBAL_STYLES_RECORD
	);
	const editEntityRecord = jest.fn();
	select.mockReturnValue( {
		__experimentalGetCurrentGlobalStylesId: getGlobalStylesId,
		getEditedEntityRecord,
	} );
	dispatch.mockReturnValue( { editEntityRecord } );
	const checkpoints = await import( '../checkpoints' );
	return {
		...checkpoints,
		getGlobalStylesId,
		getEditedEntityRecord,
		editEntityRecord,
	};
}

/** What `resolveSelect` serves for every record read. */
const withRecord = ( record: unknown ) =>
	jest.requireMock( '@wordpress/data' ).resolveSelect.mockReturnValue( {
		getEditedEntityRecord: jest.fn().mockResolvedValue( record ),
	} );

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
				createdAt: expect.any( Number ),
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

		setCheckpoint( 'toolu_1', [ 'color' ] );
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

		expect( getCheckpoints() ).toEqual( [
			{ id: 'toolu_1', checkpointKeys: [], createdAt: expect.any( Number ) },
		] );
	} );

	it( 'stores the checkpoint without a snapshot when there is no edited record', async () => {
		const { setCheckpoint, getCheckpoints, getEditedEntityRecord } = await loadCheckpoints();
		getEditedEntityRecord.mockReturnValue( undefined );

		setCheckpoint( 'toolu_1', [] );

		expect( getCheckpoints() ).toEqual( [
			{ id: 'toolu_1', checkpointKeys: [], createdAt: expect.any( Number ) },
		] );
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

describe( 'theme domain', () => {
	it( 'snapshots the global styles only for theme checkpoints', async () => {
		const { setCheckpoint, getCheckpoint, checkpointKeys } = await loadCheckpoints();

		setCheckpoint( 'color-call', [ checkpointKeys.COLOR ] );
		setCheckpoint( 'title-call', [ checkpointKeys.SITE_TITLE ] );

		expect( getCheckpoint( 'color-call' )?.themeBeforeUpdate ).toEqual( GLOBAL_STYLES_RECORD );
		expect( getCheckpoint( 'title-call' )?.themeBeforeUpdate ).toBeUndefined();
	} );
} );

describe( 'logo domain', () => {
	it( 'snapshots the current logo only for logo checkpoints', async () => {
		const { setCheckpoint, getCheckpoint, checkpointKeys } = await loadCheckpoints();

		setCheckpoint( 'logo-call', [ checkpointKeys.LOGO ] );
		setCheckpoint( 'color-call', [ checkpointKeys.COLOR ] );

		expect( getCheckpoint( 'logo-call' )?.logoBeforeUpdate ).toBe( 42 );
		expect( getCheckpoint( 'color-call' )?.logoBeforeUpdate ).toBeUndefined();
	} );

	it( 'snapshots an unset logo, so restoring can clear it again', async () => {
		const { setCheckpoint, getCheckpoint, checkpointKeys, getEditedEntityRecord } =
			await loadCheckpoints();
		getEditedEntityRecord.mockReturnValue( {} );

		setCheckpoint( 'logo-call', [ checkpointKeys.LOGO ] );

		expect( getCheckpoint( 'logo-call' )?.logoBeforeUpdate ).toBeNull();
	} );

	it( 'restores the snapshotted logo without touching the editor undo stack', async () => {
		const { setCheckpoint, restoreCheckpoint, checkpointKeys, editEntityRecord } =
			await loadCheckpoints();
		setCheckpoint( 'logo-call', [ checkpointKeys.LOGO ] );

		await restoreCheckpoint( 'logo-call' );

		expect( editEntityRecord ).toHaveBeenCalledWith(
			'root',
			'site',
			undefined,
			{ site_logo: 42 },
			{ undoIgnore: true }
		);
	} );

	it( 'leaves the logo alone when the checkpoint does not scope it', async () => {
		const { setCheckpoint, restoreCheckpoint, checkpointKeys, editEntityRecord } =
			await loadCheckpoints();
		setCheckpoint( 'color-call', [ checkpointKeys.COLOR ] );

		await restoreCheckpoint( 'color-call' );

		expect( editEntityRecord ).not.toHaveBeenCalledWith(
			'root',
			'site',
			undefined,
			expect.anything(),
			expect.anything()
		);
	} );

	it( 'keeps the logo snapshot out of the model-facing list', async () => {
		const { setCheckpoint, getAvailableCheckpoints, checkpointKeys } = await loadCheckpoints();
		setCheckpoint( 'logo-call', [ checkpointKeys.LOGO ] );

		expect( getAvailableCheckpoints()[ 0 ] ).not.toHaveProperty( 'logoBeforeUpdate' );
	} );

	it( 'throws rather than silently skipping a logo restore with no snapshot', async () => {
		const { setCheckpoint, restoreCheckpoint, checkpointKeys, getEditedEntityRecord } =
			await loadCheckpoints();
		getEditedEntityRecord.mockReturnValue( undefined );
		setCheckpoint( 'logo-call', [ checkpointKeys.LOGO ] );

		await expect( restoreCheckpoint( 'logo-call' ) ).rejects.toThrow(
			'Checkpoint has no site-logo snapshot to restore.'
		);
	} );
} );

describe( 'site domains', () => {
	// The snapshot is missing only when the site record had not loaded, so a
	// silent skip would report an undo that never ran.
	it.each( [
		[ 'site_title', 'Checkpoint has no site-title snapshot to restore.' ],
		[ 'site_metadata', 'Checkpoint has no site-metadata snapshot to restore.' ],
	] )( 'throws rather than skipping a %s restore with no snapshot', async ( key, message ) => {
		const { setCheckpoint, restoreCheckpoint, getEditedEntityRecord } = await loadCheckpoints();
		getEditedEntityRecord.mockReturnValue( undefined );
		setCheckpoint( 'site-call', [ key ] );

		await expect( restoreCheckpoint( 'site-call' ) ).rejects.toThrow( message );
	} );
} );

describe( 'hasCheckpoint / clearCheckpoint / getCheckpoints', () => {
	it( 'tracks and clears checkpoints by id, oldest first', async () => {
		const { setCheckpoint, hasCheckpoint, getCheckpoint, clearCheckpoint, getCheckpoints } =
			await loadCheckpoints();

		setCheckpoint( 'toolu_1', [] );
		setCheckpoint( 'toolu_2', [] );

		expect( hasCheckpoint( 'toolu_1' ) ).toBe( true );
		expect( getCheckpoint( 'toolu_1' ) ).toMatchObject( { id: 'toolu_1' } );
		expect( getCheckpoint( 'toolu_missing' ) ).toBeUndefined();
		expect( getCheckpoints().map( ( { id } ) => id ) ).toEqual( [ 'toolu_1', 'toolu_2' ] );

		clearCheckpoint( 'toolu_1' );

		expect( hasCheckpoint( 'toolu_1' ) ).toBe( false );
		expect( getCheckpoints().map( ( { id } ) => id ) ).toEqual( [ 'toolu_2' ] );
	} );
} );

describe( 'getAvailableCheckpoints', () => {
	it( 'advertises a restore checkpoint under the intent of the request that created it', async () => {
		const { setCheckpoint, getAvailableCheckpoints, checkpointKeys } = await loadCheckpoints();
		setCheckpoint( 'call-1', [ checkpointKeys.COLOR ], {
			toolId: 'big_sky__restore_checkpoint',
			requestIntentType: 'redo',
			createdByRequestIntentType: 'undo',
		} );

		expect( getAvailableCheckpoints()[ 0 ] ).toMatchObject( { requestIntentType: 'undo' } );
	} );

	// The list is re-sent to the agent every turn; snapshots carry whole
	// global-styles records, menu block trees and site metadata.
	it( 'sends no snapshot fields to the model', async () => {
		const { withCheckpoint, getCheckpoint, getAvailableCheckpoints, checkpointKeys } =
			await loadCheckpoints();
		const write = { toolId: 'tool', keys: Object.values( checkpointKeys ), summary: 'x' };
		withRecord( { blocks: [] } );

		await withCheckpoint( write, async ( recorder ) => {
			await recorder.captureMenu( 19 );
			recorder.capturePageRename( { pageId: 7, from: 'Old', to: 'New' } );
			recorder.markWritten( 'site_title' );
			recorder.markWritten( 'blocks' );
		} );

		// Every snapshot field is on the record, so a leak of any one would show.
		expect( Object.keys( getCheckpoint( 'call-1' ) ?? {} ) ).toEqual(
			expect.arrayContaining( [
				'themeBeforeUpdate',
				'logoBeforeUpdate',
				'blocksBeforeUpdate',
				'customCssBeforeUpdate',
				'siteTitleBeforeUpdate',
				'siteMetadataBeforeUpdate',
				'menusBeforeUpdate',
				'pageRenames',
				'writtenKeys',
			] )
		);
		expect( Object.keys( getAvailableCheckpoints()[ 0 ] ).sort() ).toEqual( [
			'checkpointId',
			'checkpointIndex',
			'checkpointKeys',
			'createdAt',
			'isLatestForTool',
			'summary',
			'toolId',
		] );
	} );

	it( 'returns an empty list without checkpoints', async () => {
		const { getAvailableCheckpoints } = await loadCheckpoints();

		expect( getAvailableCheckpoints() ).toEqual( [] );
	} );

	it( 'lists checkpoint metadata without snapshots and marks the latest per tool', async () => {
		const { setCheckpoint, getAvailableCheckpoints, checkpointKeys } = await loadCheckpoints();
		setCheckpoint( 'toolu_1', [ checkpointKeys.COLOR ], {
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
				createdAt: expect.any( Number ),
				checkpointKeys: [ 'color' ],
				toolId: 'big_sky__show_component',
				summary: 'Color picker shown.',
				isLatestForTool: false,
			},
			{
				checkpointId: 'toolu_2',
				checkpointIndex: 1,
				createdAt: expect.any( Number ),
				checkpointKeys: [ 'font' ],
				toolId: 'big_sky__show_component',
				isLatestForTool: true,
			},
			{
				checkpointId: 'toolu_3',
				checkpointIndex: 2,
				createdAt: expect.any( Number ),
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
		setCheckpoint( 'toolu_1', [ 'another' ] );

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
			'Global styles are unavailable to edit.'
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

describe( 'withCheckpoint', () => {
	const LOGO_WRITE = { toolId: 'big_sky__set_site_logo', keys: [ 'logo' ], summary: 'Logo set.' };

	// Every restore is key-gated, so a keyless checkpoint would offer an undo
	// that silently does nothing.
	it( 'records nothing when the write claims no domain', async () => {
		const { withCheckpoint, getCheckpoints } = await loadCheckpoints();

		await withCheckpoint( { toolId: 'tool', toolCallId: 'call-1', keys: [], summary: 'x' }, () =>
			Promise.resolve( 'done' )
		);

		expect( getCheckpoints() ).toEqual( [] );
	} );

	it( 'snapshots under the tool call id before writing, and returns the write', async () => {
		const { withCheckpoint, getCheckpoints } = await loadCheckpoints();
		let checkpointsAtWrite = 0;

		const result = await withCheckpoint( LOGO_WRITE, () => {
			checkpointsAtWrite = getCheckpoints().length;
			return 'written';
		} );

		expect( result ).toBe( 'written' );
		expect( checkpointsAtWrite ).toBe( 1 );
		expect( getCheckpoints() ).toEqual( [
			expect.objectContaining( {
				id: 'call-1',
				checkpointKeys: [ 'logo' ],
				toolId: 'big_sky__set_site_logo',
				summary: 'Logo set.',
				logoBeforeUpdate: SITE_RECORD.site_logo,
			} ),
		] );
	} );

	it( 'keys the snapshot by the call id it is given, without reading the history', async () => {
		const { withCheckpoint, hasCheckpoint } = await loadCheckpoints();

		await withCheckpoint( { ...LOGO_WRITE, toolCallId: 'call-2' }, () => {} );

		expect( hasCheckpoint( 'call-2' ) ).toBe( true );
		expect(
			jest.requireMock( '../tool-call-history' ).getToolCallIdFromConversationHistory
		).not.toHaveBeenCalled();
	} );

	it( 'keeps the first snapshot when the same call writes again', async () => {
		const { withCheckpoint, getCheckpoint, getEditedEntityRecord } = await loadCheckpoints();

		await withCheckpoint( LOGO_WRITE, () => {} );
		getEditedEntityRecord.mockReturnValue( { site_logo: 99 } );
		await withCheckpoint( LOGO_WRITE, () => {} );

		expect( getCheckpoint( 'call-1' )?.logoBeforeUpdate ).toBe( SITE_RECORD.site_logo );
	} );

	it( 'writes without a checkpoint when the tool call id is unknown', async () => {
		const { withCheckpoint, getCheckpoints } = await loadCheckpoints();
		jest
			.requireMock( '../tool-call-history' )
			.getToolCallIdFromConversationHistory.mockReturnValueOnce( null );
		const write = jest.fn();

		await withCheckpoint( LOGO_WRITE, write );

		expect( write ).toHaveBeenCalled();
		expect( getCheckpoints() ).toEqual( [] );
	} );

	it.each( [
		[
			'throws',
			() => {
				throw new Error( 'The site record is unavailable to edit.' );
			},
		],
		[ 'rejects', () => Promise.reject( new Error( 'The site record is unavailable to edit.' ) ) ],
	] )( 'drops the checkpoint and rethrows when the write %s', async ( _case, write ) => {
		const { withCheckpoint, hasCheckpoint } = await loadCheckpoints();

		await expect( withCheckpoint( LOGO_WRITE, write ) ).rejects.toThrow(
			'The site record is unavailable to edit.'
		);
		expect( hasCheckpoint( 'call-1' ) ).toBe( false );
	} );

	// The first run snapshots; a repeat of the same call still records the
	// page or menu it reaches, or an undo would leave that change behind.
	it( 'still records what a repeat of the same call touches', async () => {
		const { withCheckpoint, getCheckpoint } = await loadCheckpoints();
		const write = { toolId: 'tool', toolCallId: 'call-1', keys: [ 'page' ], summary: 'x' };
		const first = { pageId: 7, from: 'Old', to: 'New' };
		const second = { pageId: 8, from: 'Then', to: 'Now' };

		await withCheckpoint( write, ( recorder ) => recorder.capturePageRename( first ) );
		await withCheckpoint( write, ( recorder ) => recorder.capturePageRename( second ) );

		expect( getCheckpoint( 'call-1' )?.pageRenames ).toEqual( [ first, second ] );
	} );

	// A partial first run drops the domains it never reached; a repeat must be
	// able to record them, or its rename would apply with no way back.
	it( 'lets a repeat record a domain the first run dropped as unrecorded', async () => {
		const { withCheckpoint, getCheckpoint } = await loadCheckpoints();
		const write = { ...LOGO_WRITE, keys: [ ...LOGO_WRITE.keys, 'page' ] };
		const rename = { pageId: 7, from: 'Old', to: 'New' };

		await withCheckpoint( write, () => {} );
		expect( getCheckpoint( 'call-1' )?.checkpointKeys ).not.toContain( 'page' );

		await withCheckpoint( write, ( recorder ) => recorder.capturePageRename( rename ) );

		expect( getCheckpoint( 'call-1' )?.pageRenames ).toEqual( [ rename ] );
	} );

	// The first run's snapshot must not stand in for a fresh one that failed.
	it( 'refuses a repeat whose re-added domain cannot be snapshotted again', async () => {
		const { withCheckpoint, getCheckpoint, getEditedEntityRecord } = await loadCheckpoints();
		const write = { ...LOGO_WRITE, keys: [ 'page', 'site_title' ] };

		getEditedEntityRecord.mockReturnValue( { title: 'Old' } );
		await withCheckpoint( write, ( recorder ) =>
			recorder.capturePageRename( { pageId: 7, from: 'Old', to: 'New' } )
		);

		getEditedEntityRecord.mockReturnValue( undefined );
		await expect( withCheckpoint( write, jest.fn() ) ).rejects.toThrow(
			'Cannot record a way back for site_title'
		);
		expect( getCheckpoint( 'call-1' )?.checkpointKeys ).toEqual( [ 'page' ] );
	} );

	// A domain that snapshots up front and cannot be read would leave the
	// change with no way back, so the write is refused instead.
	it( 'refuses a write whose eager domain cannot be snapshotted', async () => {
		const { withCheckpoint, hasCheckpoint, getEditedEntityRecord } = await loadCheckpoints();
		const write = jest.fn();

		getEditedEntityRecord.mockReturnValue( undefined );

		await expect(
			withCheckpoint( { ...LOGO_WRITE, keys: [ 'page', 'site_title' ] }, write )
		).rejects.toThrow( 'Cannot record a way back for site_title' );
		expect( write ).not.toHaveBeenCalled();
		expect( hasCheckpoint( 'call-1' ) ).toBe( false );
	} );

	// The first run never wrote the domain it dropped, so the snapshot it left
	// behind may predate a change made since; the repeat's own is the true one.
	it( 'snapshots a re-added eager domain afresh', async () => {
		const { withCheckpoint, getCheckpoint, getEditedEntityRecord } = await loadCheckpoints();
		const write = { ...LOGO_WRITE, keys: [ 'page', 'site_title' ] };
		const rename = { pageId: 7, from: 'Old', to: 'New' };

		getEditedEntityRecord.mockReturnValue( { title: 'Before the first attempt' } );
		await withCheckpoint( write, ( recorder ) => recorder.capturePageRename( rename ) );

		getEditedEntityRecord.mockReturnValue( { title: 'Changed since' } );
		await withCheckpoint( write, ( recorder ) => recorder.markWritten( 'site_title' ) );

		expect( getCheckpoint( 'call-1' )?.siteTitleBeforeUpdate ).toBe( 'Changed since' );
	} );

	// Site title and metadata snapshot up front but are written mid-batch, so a
	// batch that fails before reaching them must not keep an undo for them.
	it( 'drops an eager site domain the write never reached', async () => {
		const { withCheckpoint, getCheckpoint, getEditedEntityRecord } = await loadCheckpoints();
		getEditedEntityRecord.mockReturnValue( { title: 'Old' } );
		const write = { ...LOGO_WRITE, keys: [ 'page', 'site_title' ] };

		await withCheckpoint( write, ( recorder ) =>
			recorder.capturePageRename( { pageId: 7, from: 'Old', to: 'New' } )
		);

		expect( getCheckpoint( 'call-1' )?.checkpointKeys ).toEqual( [ 'page' ] );
	} );

	it( "puts a repeat's re-declared domains back when it throws", async () => {
		const { withCheckpoint, getCheckpoint, getEditedEntityRecord } = await loadCheckpoints();
		const write = { ...LOGO_WRITE, keys: [ 'page', 'site_title' ] };

		// The first run never reaches the site title, so the domain is dropped.
		getEditedEntityRecord.mockReturnValue( { title: 'Old' } );
		await withCheckpoint( write, ( recorder ) =>
			recorder.capturePageRename( { pageId: 7, from: 'Old', to: 'New' } )
		);

		await expect(
			withCheckpoint( write, () => {
				throw new Error( 'x' );
			} )
		).rejects.toThrow( 'x' );

		expect( getCheckpoint( 'call-1' )?.checkpointKeys ).toEqual( [ 'page' ] );
	} );

	it( 'keeps the first snapshot when a repeat write throws', async () => {
		const { withCheckpoint, hasCheckpoint } = await loadCheckpoints();
		await withCheckpoint( LOGO_WRITE, () => {} );

		await expect(
			withCheckpoint( LOGO_WRITE, () => {
				throw new Error( 'The site record is unavailable to edit.' );
			} )
		).rejects.toThrow();
		expect( hasCheckpoint( 'call-1' ) ).toBe( true );
	} );
} );

describe( 'restore by domain', () => {
	const ITEM = { name: 'core/navigation-link', attributes: { label: 'Old' }, innerBlocks: [] };

	it( 'puts the menus back as they were, out of the undo stack', async () => {
		const { setCheckpoint, restoreCheckpoint, getCheckpoint, editEntityRecord } =
			await loadCheckpoints();
		withRecord( { id: 19, blocks: [] } );
		setCheckpoint( 'call-1', [ 'navigation' ] );
		Object.assign( getCheckpoint( 'call-1' ) ?? {}, {
			menusBeforeUpdate: [ { id: 19, items: [ ITEM ] } ],
		} );

		await restoreCheckpoint( 'call-1' );

		expect( editEntityRecord ).toHaveBeenCalledWith(
			'postType',
			'wp_navigation',
			19,
			{ blocks: [ ITEM ], content: '' },
			{ undoIgnore: true }
		);
	} );

	// Checked before any write: a menu deleted since would otherwise fail
	// after the others were already put back.
	it( 'writes no menu when one of them no longer exists', async () => {
		const { setCheckpoint, restoreCheckpoint, getCheckpoint, editEntityRecord } =
			await loadCheckpoints();
		jest.requireMock( '@wordpress/data' ).resolveSelect.mockReturnValue( {
			getEditedEntityRecord: jest.fn( ( _kind: string, _name: string, id: number ) =>
				Promise.resolve( id === 19 ? { id, blocks: [] } : null )
			),
		} );
		setCheckpoint( 'call-1', [ 'navigation' ] );
		Object.assign( getCheckpoint( 'call-1' ) ?? {}, {
			menusBeforeUpdate: [
				{ id: 19, items: [] },
				{ id: 20, items: [] },
			],
		} );

		await expect( restoreCheckpoint( 'call-1' ) ).rejects.toThrow(
			'Navigation menu not found: 20'
		);
		expect( editEntityRecord ).not.toHaveBeenCalled();
	} );

	// Newest first, so a page renamed twice in one call ends at its first title.
	it( 'puts page titles back newest first', async () => {
		const { setCheckpoint, restoreCheckpoint, getCheckpoint, editEntityRecord } =
			await loadCheckpoints();
		withRecord( { title: 'C' } );
		setCheckpoint( 'call-1', [ 'page' ] );
		Object.assign( getCheckpoint( 'call-1' ) ?? {}, {
			pageRenames: [
				{ pageId: 7, from: 'A', to: 'B' },
				{ pageId: 7, from: 'B', to: 'C' },
			],
		} );

		await restoreCheckpoint( 'call-1' );

		expect( editEntityRecord ).toHaveBeenNthCalledWith(
			1,
			'postType',
			'page',
			7,
			{ title: 'B' },
			{ undoIgnore: true }
		);
		expect( editEntityRecord ).toHaveBeenNthCalledWith(
			2,
			'postType',
			'page',
			7,
			{ title: 'A' },
			{ undoIgnore: true }
		);
	} );

	it( 'puts the site title and metadata back as pending edits', async () => {
		const { setCheckpoint, restoreCheckpoint, getEditedEntityRecord, editEntityRecord } =
			await loadCheckpoints();
		getEditedEntityRecord.mockReturnValue( {
			title: 'Old',
			big_sky_site_metadata: '{"personality":"calm"}',
		} );
		setCheckpoint( 'call-1', [ 'site_title', 'site_metadata' ] );
		// A key introduced since: the metadata is replaced, not merged onto.
		getEditedEntityRecord.mockReturnValue( {
			title: 'New',
			big_sky_site_metadata: '{"personality":"bold","siteLocation":{"name":"Lisbon"}}',
		} );

		await restoreCheckpoint( 'call-1' );

		expect( editEntityRecord ).toHaveBeenCalledWith(
			'root',
			'site',
			undefined,
			{ title: 'Old' },
			{
				undoIgnore: true,
			}
		);
		expect( editEntityRecord ).toHaveBeenCalledWith(
			'root',
			'site',
			undefined,
			{ big_sky_site_metadata: JSON.stringify( { personality: 'calm' } ) },
			{ undoIgnore: true }
		);
	} );
} );

describe( 'blocks domain', () => {
	const paragraph = ( clientId: string ) => ( {
		clientId,
		name: 'core/paragraph',
		attributes: { content: 'x'.repeat( 300 ) },
		innerBlocks: [],
	} );
	const page = ( count: number ) =>
		Array.from( { length: count }, ( _, index ) => paragraph( `p${ index }` ) );
	const editorBlocks = () => jest.requireMock( '../editor-blocks' );

	// The post the mocked editor holds, under a post-content root.
	const post = { id: 7, type: 'page', title: 'About' };
	// A checkpoint of that page, untitled, so a refusal names it by type and id.
	const target = {
		id: 'target',
		checkpointKeys: [ 'blocks' ],
		createdAt: 0,
		blocksBeforeUpdate: {
			rootKind: 'post-content',
			blocks: [],
			templateParts: [],
			post: { id: 7, type: 'page' },
		},
	} as never;

	it( 'snapshots the root by kind, its blocks by value, and the post', async () => {
		const { setCheckpoint, getCheckpoint } = await loadCheckpoints();
		const live = page( 1 );
		editorBlocks().getRootBlocks.mockReturnValue( live );

		setCheckpoint( 'call-1', [ 'blocks' ] );
		live[ 0 ].attributes.content = 'mutated';

		expect( getCheckpoint( 'call-1' )?.blocksBeforeUpdate ).toEqual( {
			rootKind: 'post-content',
			blocks: page( 1 ),
			templateParts: [],
			post,
		} );
	} );

	// A missing snapshot means the capture failed, so the restore is refused.
	it( 'snapshots nothing while the canvas has no root, and refuses to restore it', async () => {
		const { setCheckpoint, getCheckpoint, restoreCheckpoint } = await loadCheckpoints();
		editorBlocks().resolveBlocksRoot.mockReturnValue( null );

		setCheckpoint( 'call-1', [ 'blocks' ] );

		expect( getCheckpoint( 'call-1' )?.blocksBeforeUpdate ).toBeUndefined();
		await expect( restoreCheckpoint( 'call-1' ) ).rejects.toThrow( 'no blocks snapshot' );
	} );

	// The root is resolved again: its clientId does not survive the editor
	// remounting, and the post id may come back as a string.
	it( 'puts the blocks back under the root as it is now, outside the undo stack', async () => {
		const { setCheckpoint, restoreCheckpoint } = await loadCheckpoints();
		editorBlocks().getRootBlocks.mockReturnValueOnce( page( 2 ) );
		setCheckpoint( 'call-1', [ 'blocks' ] );
		editorBlocks().resolveBlocksRoot.mockReturnValue( {
			kind: 'post-content',
			clientId: 'pc-remounted',
			post: { ...post, id: '7' },
		} );
		editorBlocks().getRootBlocks.mockReturnValue( page( 3 ) );

		await restoreCheckpoint( 'call-1' );

		expect( editorBlocks().stageRootBlocks ).toHaveBeenCalledWith( 'pc-remounted', page( 2 ) );
	} );

	it.each( [
		{
			case: 'another page',
			root: { kind: 'post-content', clientId: 'pc', post: { id: 8, type: 'page' } },
		},
		{ case: 'a view showing another root', root: { kind: 'section', clientId: 's', post } },
		{ case: 'an editor still loading', root: null },
	] )( 'refuses to restore into $case', async ( { root } ) => {
		const { setCheckpoint, restoreCheckpoint } = await loadCheckpoints();
		setCheckpoint( 'call-1', [ 'blocks' ] );
		editorBlocks().resolveBlocksRoot.mockReturnValue( root );

		await expect( restoreCheckpoint( 'call-1' ) ).rejects.toThrow( 'belongs to “About”' );
		expect( editorBlocks().stageRootBlocks ).not.toHaveBeenCalled();
	} );

	// A snapshot taken before the canvas had loaded would wipe the page.
	it( 'refuses a restore that would collapse the page, and records it', async () => {
		const { setCheckpoint, restoreCheckpoint } = await loadCheckpoints();
		const { recordBigSkyTracksEvent } = jest.requireMock( '../tracks' );
		editorBlocks().getRootBlocks.mockReturnValueOnce( page( 1 ) );
		setCheckpoint( 'call-1', [ 'blocks' ] );
		editorBlocks().getRootBlocks.mockReturnValue( page( 6 ) );

		await expect( restoreCheckpoint( 'call-1' ) ).rejects.toThrow( 'much smaller block snapshot' );

		expect( editorBlocks().stageRootBlocks ).not.toHaveBeenCalled();
		expect( recordBigSkyTracksEvent ).toHaveBeenCalledWith(
			'jetpack_big_sky_checkpoint_restore_blocked',
			expect.objectContaining( {
				reason: 'content_shrink',
				checkpoint_id: 'call-1',
				current_block_count: 6,
				restore_block_count: 1,
			} )
		);
	} );

	// Measured on the block markup, as Big Sky measures it.
	it( 'refuses a restore that would shrink the page to under a fifth of its markup', async () => {
		const { setCheckpoint, restoreCheckpoint } = await loadCheckpoints();
		jest
			.requireMock( '@wordpress/blocks' )
			.serialize.mockImplementation( ( blocks: { attributes: { content: string } }[] ) =>
				blocks.map( ( block ) => block.attributes.content ).join( '' )
			);
		const shortPage = Array.from( { length: 3 }, ( _, index ) => ( {
			...paragraph( `s${ index }` ),
			attributes: { content: 'x' },
		} ) );
		editorBlocks().getRootBlocks.mockReturnValueOnce( shortPage );
		setCheckpoint( 'call-1', [ 'blocks' ] );
		editorBlocks().getRootBlocks.mockReturnValue( page( 4 ) );

		await expect( restoreCheckpoint( 'call-1' ) ).rejects.toThrow( 'much smaller block snapshot' );
	} );

	// Each design checkpoints the page it replaced, so undoing twice walks back.
	it( 'undoes two designs in turn, back to the original page', async () => {
		const { setCheckpoint, restoreCheckpoint } = await loadCheckpoints();
		const original = page( 3 );
		const first = page( 4 );
		editorBlocks().getRootBlocks.mockReturnValueOnce( original );
		setCheckpoint( 'call-1', [ 'blocks' ] );
		editorBlocks().getRootBlocks.mockReturnValueOnce( first );
		setCheckpoint( 'call-2', [ 'blocks' ] );
		editorBlocks().getRootBlocks.mockReturnValue( page( 5 ) );

		await restoreCheckpoint( 'call-2' );

		expect( editorBlocks().stageRootBlocks ).toHaveBeenLastCalledWith( 'pc', first );

		editorBlocks().getRootBlocks.mockReturnValue( first );
		await restoreCheckpoint( 'call-1' );

		expect( editorBlocks().stageRootBlocks ).toHaveBeenLastCalledWith( 'pc', original );
	} );

	// The redo puts back the page as the undo is about to overwrite it.
	it( 'records the current blocks in the reciprocal', async () => {
		const { setReciprocalCheckpoint, getCheckpoint } = await loadCheckpoints();
		editorBlocks().getRootBlocks.mockReturnValue( page( 2 ) );

		await setReciprocalCheckpoint( 'redo', target, {} );

		expect( getCheckpoint( 'redo' )?.blocksBeforeUpdate ).toEqual( {
			rootKind: 'post-content',
			blocks: page( 2 ),
			templateParts: [],
			post,
		} );
	} );

	it( 'refuses a restore from another page, and records it', async () => {
		const { setCheckpoint, restoreCheckpoint } = await loadCheckpoints();
		const { recordBigSkyTracksEvent } = jest.requireMock( '../tracks' );
		setCheckpoint( 'call-1', [ 'blocks' ] );
		editorBlocks().resolveBlocksRoot.mockReturnValue( {
			kind: 'post-content',
			clientId: 'pc',
			post: { id: 8, type: 'page' },
		} );

		await expect( restoreCheckpoint( 'call-1' ) ).rejects.toThrow( 'belongs to “About”' );

		expect( editorBlocks().stageRootBlocks ).not.toHaveBeenCalled();
		expect( recordBigSkyTracksEvent ).toHaveBeenCalledWith(
			'jetpack_big_sky_checkpoint_restore_blocked',
			expect.objectContaining( {
				reason: 'editor_scope_mismatch',
				checkpoint_post_id: 7,
				current_post_id: 8,
			} )
		);
	} );

	it( 'refuses a reciprocal from another page', async () => {
		const { setReciprocalCheckpoint, getCheckpoint } = await loadCheckpoints();
		editorBlocks().resolveBlocksRoot.mockReturnValue( {
			kind: 'post-content',
			clientId: 'pc',
			post: { id: 8, type: 'page' },
		} );

		await expect( setReciprocalCheckpoint( 'redo', target, {} ) ).rejects.toThrow(
			'belongs to page 7'
		);
		expect( getCheckpoint( 'redo' ) ).toBeUndefined();
	} );
} );

describe( 'restore order', () => {
	// The page guard refuses before any site-wide domain is written.
	it( 'restores blocks before the site-wide domains, so a page guard fails first', async () => {
		const { setCheckpoint, restoreCheckpoint, editEntityRecord } = await loadCheckpoints();
		const editorBlocks = jest.requireMock( '../editor-blocks' );
		editorBlocks.resolveBlocksRoot.mockReturnValue( {
			kind: 'post-content',
			clientId: 'pc',
			post: { id: 7, type: 'page' },
		} );
		setCheckpoint( 'call-1', [ 'blocks', 'custom_css' ] );
		editorBlocks.resolveBlocksRoot.mockReturnValue( {
			kind: 'post-content',
			clientId: 'pc',
			post: { id: 8, type: 'page' },
		} );

		await expect( restoreCheckpoint( 'call-1' ) ).rejects.toThrow( 'belongs to' );
		expect( editEntityRecord ).not.toHaveBeenCalled();
	} );

	// A page deleted since makes the title restore throw; menus must not have
	// been rewritten by then, or the failure leaves a half-restored site.
	it( 'restores page titles before menus, so a missing page fails first', async () => {
		const { setCheckpoint, restoreCheckpoint, getCheckpoint, editEntityRecord } =
			await loadCheckpoints();
		withRecord( null );

		setCheckpoint( 'call-1', [ 'page', 'navigation' ] );
		Object.assign( getCheckpoint( 'call-1' ) ?? {}, {
			pageRenames: [ { pageId: 7, from: 'Old', to: 'New' } ],
			menusBeforeUpdate: [ { id: 19, items: [] } ],
		} );

		await expect( restoreCheckpoint( 'call-1' ) ).rejects.toThrow( 'Page 7 could not be read' );
		expect( editEntityRecord ).not.toHaveBeenCalled();
	} );
} );

describe( 'setReciprocalCheckpoint', () => {
	const target = ( pageRenames: unknown[], menusBeforeUpdate: unknown[] = [] ) =>
		( {
			id: 'target',
			checkpointKeys: [ 'page', 'navigation' ],
			createdAt: 0,
			pageRenames,
			menusBeforeUpdate,
		} ) as never;

	// The redo returns to the title the undo is about to overwrite.
	it( 'records each renamed page once, at its current title', async () => {
		const { setReciprocalCheckpoint, getCheckpoint } = await loadCheckpoints();
		withRecord( { title: 'Renamed since' } );

		await setReciprocalCheckpoint(
			'redo',
			target( [
				{ pageId: 7, from: 'A', to: 'B' },
				{ pageId: 7, from: 'B', to: 'C' },
			] ),
			{}
		);

		expect( getCheckpoint( 'redo' )?.pageRenames ).toEqual( [
			{ pageId: 7, from: 'Renamed since', to: 'Renamed since' },
		] );
	} );

	// The redo puts back the menu as the undo is about to overwrite it.
	it( 'snapshots each menu as it is now', async () => {
		const { setReciprocalCheckpoint, getCheckpoint } = await loadCheckpoints();
		const item = { name: 'core/navigation-link', attributes: { label: 'Now' }, innerBlocks: [] };
		withRecord( { id: 19, blocks: [ item ] } );

		await setReciprocalCheckpoint( 'redo', target( [], [ { id: 19, items: [] } ] ), {} );

		expect( getCheckpoint( 'redo' )?.menusBeforeUpdate ).toEqual( [ { id: 19, items: [ item ] } ] );
	} );

	it( 'records nothing when a menu it must snapshot cannot be read', async () => {
		const { setReciprocalCheckpoint, hasCheckpoint } = await loadCheckpoints();
		withRecord( null );

		await expect(
			setReciprocalCheckpoint( 'redo', target( [], [ { id: 19, items: [] } ] ), {} )
		).rejects.toThrow( 'Navigation menu not found: 19' );
		expect( hasCheckpoint( 'redo' ) ).toBe( false );
	} );

	it( 'records nothing when a claimed domain cannot be snapshotted', async () => {
		const { setReciprocalCheckpoint, hasCheckpoint, getEditedEntityRecord } =
			await loadCheckpoints();
		const siteTitleTarget = { id: 'target', checkpointKeys: [ 'site_title' ], createdAt: 0 };
		getEditedEntityRecord.mockReturnValue( undefined );

		await expect( setReciprocalCheckpoint( 'redo', siteTitleTarget, {} ) ).rejects.toThrow(
			'Could not snapshot site_title for a redo.'
		);
		expect( hasCheckpoint( 'redo' ) ).toBe( false );
	} );
} );

describe( 'checkpoint recorder', () => {
	const RENAME = { pageId: 7, from: 'Old', to: 'New' };
	const write = ( keys: string[] ) => ( { toolId: 'tool', keys, summary: 'Changed.' } );

	// The recorder captures domains a write only discovers as it runs, so the
	// key gate has to hold there too — a restore must never touch a domain the
	// write did not declare.
	it( 'ignores a rename from a write that never claimed the page domain', async () => {
		const { withCheckpoint, getCheckpoint } = await loadCheckpoints();

		await withCheckpoint( write( [ 'logo' ] ), ( recorder ) =>
			recorder.capturePageRename( RENAME )
		);

		expect( getCheckpoint( 'call-1' )?.pageRenames ).toBeUndefined();
	} );

	it( 'refuses the write when the menu it must snapshot cannot be read', async () => {
		const { withCheckpoint } = await loadCheckpoints();
		withRecord( null );

		await expect(
			withCheckpoint( write( [ 'navigation' ] ), ( recorder ) => recorder.captureMenu( 19 ) )
		).rejects.toThrow( 'Navigation menu not found: 19' );
	} );

	// The caller discards the snapshot it took when its write fails; a second
	// write to the same menu must not take the first one's snapshot with it.
	it( 'reports only the call that added the menu snapshot', async () => {
		const { withCheckpoint, getCheckpoint } = await loadCheckpoints();
		withRecord( { blocks: [] } );
		const captured: boolean[] = [];

		await withCheckpoint( write( [ 'navigation' ] ), async ( recorder ) => {
			captured.push( await recorder.captureMenu( 19 ) );
			captured.push( await recorder.captureMenu( 19 ) );
		} );

		expect( captured ).toEqual( [ true, false ] );
		expect( getCheckpoint( 'call-1' )?.menusBeforeUpdate ).toHaveLength( 1 );
	} );

	it( 'ignores a menu from a write that never claimed the navigation domain', async () => {
		const { withCheckpoint, getCheckpoint } = await loadCheckpoints();

		await withCheckpoint( write( [ 'logo' ] ), ( recorder ) => recorder.captureMenu( 19 ) );

		expect( getCheckpoint( 'call-1' )?.menusBeforeUpdate ).toBeUndefined();
	} );
} );

describe( 'template parts', () => {
	const editorBlocks = () => jest.requireMock( '../editor-blocks' );
	const part = ( slug: string, content: string ) => ( {
		slug,
		blocks: [
			{ clientId: `${ slug }-1`, name: 'core/paragraph', attributes: { content }, innerBlocks: [] },
		],
	} );

	// The page shows every part under `<slug>-part`; loaded after the module
	// reset, which hands out fresh mock instances.
	async function loadWithParts() {
		const checkpoints = await loadCheckpoints();
		jest.requireMock( '@wordpress/blocks' ).serialize.mockImplementation( JSON.stringify );
		editorBlocks().findTemplatePartClientId.mockImplementation(
			( slug: string ) => `${ slug }-part`
		);

		return checkpoints;
	}

	// The editor keeps a part's blocks apart from the tree, so the root's
	// snapshot alone would miss an edit inside the header.
	it( 'snapshots every part beside the root, and puts back only those that differ', async () => {
		const { setCheckpoint, restoreCheckpoint, getCheckpoint } = await loadWithParts();
		editorBlocks().getTemplatePartBlocks.mockReturnValue( [
			part( 'header', 'Old' ),
			part( 'footer', 'Same' ),
		] );
		setCheckpoint( 'call-1', [ 'blocks' ] );
		editorBlocks().getBlocks.mockImplementation( ( clientId: string ) =>
			clientId === 'header-part' ? part( 'header', 'New' ).blocks : part( 'footer', 'Same' ).blocks
		);

		await restoreCheckpoint( 'call-1' );

		expect( getCheckpoint( 'call-1' )?.blocksBeforeUpdate?.templateParts ).toEqual( [
			part( 'header', 'Old' ),
			part( 'footer', 'Same' ),
		] );
		expect( editorBlocks().stageRootBlocks.mock.calls ).toEqual( [
			[ 'pc', [] ],
			[ 'header-part', part( 'header', 'Old' ).blocks ],
		] );
	} );

	// A part still loading reads as empty; put back, the next save would empty
	// it. The rest of the page is still restored.
	it( 'leaves a part alone whose snapshot is empty while it has content, and records it', async () => {
		const { setCheckpoint, restoreCheckpoint } = await loadWithParts();
		const { recordBigSkyTracksEvent } = jest.requireMock( '../tracks' );
		editorBlocks().getTemplatePartBlocks.mockReturnValue( [ { slug: 'header', blocks: [] } ] );
		setCheckpoint( 'call-1', [ 'blocks' ] );
		editorBlocks().getBlocks.mockReturnValue( part( 'header', 'Loaded' ).blocks );

		await restoreCheckpoint( 'call-1' );

		expect( editorBlocks().stageRootBlocks.mock.calls ).toEqual( [ [ 'pc', [] ] ] );
		expect( recordBigSkyTracksEvent ).toHaveBeenCalledWith(
			'jetpack_big_sky_checkpoint_restore_blocked',
			expect.objectContaining( { reason: 'template_part_would_empty' } )
		);
	} );

	it( 'refuses, before any write, when a snapshotted part is not on the page', async () => {
		const { setCheckpoint, restoreCheckpoint } = await loadWithParts();
		editorBlocks().getTemplatePartBlocks.mockReturnValue( [ part( 'header', 'Old' ) ] );
		setCheckpoint( 'call-1', [ 'blocks' ] );
		editorBlocks().findTemplatePartClientId.mockReturnValue( undefined );

		await expect( restoreCheckpoint( 'call-1' ) ).rejects.toThrow(
			'“header” template part is not on this page'
		);

		expect( editorBlocks().stageRootBlocks ).not.toHaveBeenCalled();
	} );
} );

describe( 'custom CSS domain', () => {
	it.each( [
		[ 'the css it holds', { styles: { css: 'a{}' } }, 'a{}' ],
		[ 'an empty string without one', { styles: {} }, '' ],
	] )( 'snapshots %s and puts it back beside the other styles', async ( _, record, css ) => {
		const {
			setCheckpoint,
			restoreCheckpoint,
			getCheckpoint,
			getEditedEntityRecord,
			editEntityRecord,
		} = await loadCheckpoints();
		getEditedEntityRecord.mockReturnValue( record );
		setCheckpoint( 'call-1', [ 'custom_css' ] );
		getEditedEntityRecord.mockReturnValue( { styles: { css: 'b{}', color: {} } } );

		await restoreCheckpoint( 'call-1' );

		expect( getCheckpoint( 'call-1' )?.customCssBeforeUpdate ).toBe( css );
		expect( editEntityRecord ).toHaveBeenCalledWith(
			'root',
			'globalStyles',
			'global-styles-1',
			{ styles: { css, color: {} } },
			{ undoIgnore: true }
		);
	} );

	it( 'refuses the write when the global styles cannot be read', async () => {
		const { withCheckpoint, getEditedEntityRecord } = await loadCheckpoints();
		getEditedEntityRecord.mockReturnValue( undefined );
		const write = jest.fn();

		await expect(
			withCheckpoint( { toolId: 'tool', keys: [ 'custom_css' ], summary: 'x' }, write )
		).rejects.toThrow( 'Cannot record a way back for custom_css' );

		expect( write ).not.toHaveBeenCalled();
	} );
} );

describe( 'mid-batch domains', () => {
	// The blocks and CSS are written part-way through a batch: a batch that
	// never changed them would otherwise offer an undo that does nothing.
	it.each( [ 'blocks', 'custom_css' ] )(
		'keeps the %s domain only when the write marks it written',
		async ( key ) => {
			const { withCheckpoint, getCheckpoint } = await loadCheckpoints();
			const write = { toolId: 'tool', keys: [ key ], summary: 'x' };

			await withCheckpoint( { ...write, toolCallId: 'unwritten' }, () => undefined );
			await withCheckpoint( { ...write, toolCallId: 'written' }, ( recorder ) =>
				recorder.markWritten( key )
			);

			expect( getCheckpoint( 'unwritten' ) ).toBeUndefined();
			expect( getCheckpoint( 'written' )?.checkpointKeys ).toEqual( [ key ] );
		}
	);
} );

describe( 'inline swap', () => {
	const editorBlocks = () => jest.requireMock( '../editor-blocks' );
	const paragraph = ( content: string ) => ( {
		clientId: 'p1',
		name: 'core/paragraph',
		attributes: { content },
		innerBlocks: [],
	} );
	const before = [ paragraph( 'Before' ) ];
	const after = [ paragraph( 'After' ) ];

	// A sealed checkpoint of `before`, with the page now showing `after`; a
	// tracked write shows what it wrote, as the store does.
	async function sealedEdit() {
		const checkpoints = await loadCheckpoints();
		jest.requireMock( '@wordpress/blocks' ).serialize.mockImplementation( JSON.stringify );
		editorBlocks().replaceRootBlocks.mockImplementation( ( _: string, blocks: unknown ) =>
			editorBlocks().getRootBlocks.mockReturnValue( blocks )
		);
		editorBlocks().getRootBlocks.mockReturnValueOnce( before );
		checkpoints.setCheckpoint( 'call-1', [ 'blocks' ], { toolId: 'big_sky__apply_block_edits' } );
		editorBlocks().getRootBlocks.mockReturnValue( after );

		return checkpoints;
	}

	it( 'seals only a checkpoint that holds nothing but the page blocks', async () => {
		const { setCheckpoint, sealCheckpointForSwap, canSwapCheckpoint } = await sealedEdit();
		setCheckpoint( 'mixed', [ 'blocks', 'custom_css' ] );

		expect( sealCheckpointForSwap( 'mixed' ) ).toBe( false );
		expect( sealCheckpointForSwap( 'call-1' ) ).toBe( true );
		expect( canSwapCheckpoint( 'mixed' ) ).toBeUndefined();
		expect( canSwapCheckpoint( 'call-1' ) ).toBe( true );
	} );

	it( 'cannot swap or restore once the page drifted', async () => {
		const { sealCheckpointForSwap, canSwapCheckpoint, swapCheckpoint, restoreCheckpoint } =
			await sealedEdit();
		sealCheckpointForSwap( 'call-1' );
		editorBlocks().getRootBlocks.mockReturnValue( [ paragraph( 'Typed since' ) ] );

		expect( canSwapCheckpoint( 'call-1' ) ).toBe( false );
		await expect( swapCheckpoint( 'call-1' ) ).rejects.toThrow( 'Checkpoint swap was blocked' );
		await expect( restoreCheckpoint( 'call-1' ) ).rejects.toThrow( 'editor content changed' );
		expect( editorBlocks().replaceRootBlocks ).not.toHaveBeenCalled();
		expect( editorBlocks().stageRootBlocks ).not.toHaveBeenCalled();
	} );

	it( 'cannot swap from another page', async () => {
		const { sealCheckpointForSwap, canSwapCheckpoint } = await sealedEdit();
		sealCheckpointForSwap( 'call-1' );
		editorBlocks().resolveBlocksRoot.mockReturnValue( {
			kind: 'post-content',
			clientId: 'pc',
			post: { id: 8, type: 'page' },
		} );

		expect( canSwapCheckpoint( 'call-1' ) ).toBe( false );
	} );

	// Undo puts `before` back as a tracked write and keeps `after` for the
	// redo, which the agent sees as the restore it was; redo swaps back.
	it( 'swaps back and forth as tracked writes, each side holding the other', async () => {
		const { sealCheckpointForSwap, swapCheckpoint, getCheckpoint, canSwapCheckpoint } =
			await sealedEdit();
		sealCheckpointForSwap( 'call-1' );

		await swapCheckpoint( 'call-1' );

		expect( editorBlocks().replaceRootBlocks ).toHaveBeenLastCalledWith( 'pc', before );
		expect( editorBlocks().stageRootBlocks ).not.toHaveBeenCalled();
		expect( getCheckpoint( 'call-1' ) ).toEqual(
			expect.objectContaining( {
				toolId: 'big_sky__restore_checkpoint',
				requestIntentType: 'redo',
				createdByRequestIntentType: 'undo',
				blocksBeforeUpdate: expect.objectContaining( { blocks: after } ),
				inlineSwap: {
					action: 'redo',
					expectedSignature: expect.any( String ),
					toolId: 'big_sky__apply_block_edits',
				},
			} )
		);

		expect( canSwapCheckpoint( 'call-1' ) ).toBe( true );
		await swapCheckpoint( 'call-1' );

		expect( editorBlocks().replaceRootBlocks ).toHaveBeenLastCalledWith( 'pc', after );
		expect( getCheckpoint( 'call-1' ) ).toEqual(
			expect.objectContaining( {
				toolId: 'big_sky__apply_block_edits',
				requestIntentType: 'undo',
				blocksBeforeUpdate: expect.objectContaining( { blocks: before } ),
			} )
		);
	} );

	it( 'keeps the seal out of the model-facing list', async () => {
		const { sealCheckpointForSwap, getAvailableCheckpoints } = await sealedEdit();
		sealCheckpointForSwap( 'call-1' );

		expect( getAvailableCheckpoints()[ 0 ] ).not.toHaveProperty( 'inlineSwap' );
	} );
} );
