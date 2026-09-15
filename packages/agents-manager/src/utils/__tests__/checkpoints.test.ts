jest.mock( '@wordpress/core-data', () => ( { store: 'core' } ) );
jest.mock( '../tool-call-history', () => ( {
	getToolCallIdFromConversationHistory: jest.fn( () => 'call-1' ),
} ) );
jest.mock( '@wordpress/data', () => ( {
	select: jest.fn(),
	dispatch: jest.fn(),
	resolveSelect: jest.fn(),
} ) );
jest.mock( '../editor-blocks', () => ( {
	getCurrentPost: jest.fn( () => ( { id: 7, type: 'page' } ) ),
	getRootBlocks: jest.fn( () => [] ),
	resolveBlocksRoot: jest.fn( () => ( { kind: 'post-content', clientId: 'pc' } ) ),
	stageRootBlocks: jest.fn(),
} ) );
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
	const saveSpecifiedEntityEdits = jest.fn();
	select.mockReturnValue( {
		__experimentalGetCurrentGlobalStylesId: getGlobalStylesId,
		getEditedEntityRecord,
	} );
	dispatch.mockReturnValue( {
		editEntityRecord,
		__experimentalSaveSpecifiedEntityEdits: saveSpecifiedEntityEdits,
	} );
	const checkpoints = await import( '../checkpoints' );
	return {
		...checkpoints,
		getGlobalStylesId,
		getEditedEntityRecord,
		editEntityRecord,
		saveSpecifiedEntityEdits,
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
		} );

		// Every snapshot field is on the record, so a leak of any one would show.
		expect( Object.keys( getCheckpoint( 'call-1' ) ?? {} ) ).toEqual(
			expect.arrayContaining( [
				'themeBeforeUpdate',
				'logoBeforeUpdate',
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

	it( 'puts the site title and metadata back, and saves each', async () => {
		const {
			setCheckpoint,
			restoreCheckpoint,
			getEditedEntityRecord,
			editEntityRecord,
			saveSpecifiedEntityEdits,
		} = await loadCheckpoints();
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
		expect( saveSpecifiedEntityEdits.mock.calls.map( ( call ) => call[ 3 ] ) ).toEqual( [
			[ 'title' ],
			[ 'big_sky_site_metadata' ],
		] );
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

	beforeEach( () => {
		editorBlocks().resolveBlocksRoot.mockReturnValue( { kind: 'post-content', clientId: 'pc' } );
		editorBlocks().getCurrentPost.mockReturnValue( { id: 7, type: 'page' } );
		editorBlocks().getRootBlocks.mockReturnValue( [] );
	} );

	it( 'snapshots the root by kind, its blocks by value, and the post', async () => {
		const { setCheckpoint, getCheckpoint } = await loadCheckpoints();
		const live = page( 1 );
		editorBlocks().getRootBlocks.mockReturnValue( live );

		setCheckpoint( 'call-1', [ 'blocks' ] );

		const snapshot = getCheckpoint( 'call-1' )?.blocksBeforeUpdate;
		expect( snapshot ).toEqual( {
			rootKind: 'post-content',
			blocks: live,
			post: { id: 7, type: 'page' },
		} );
		expect( snapshot?.blocks ).not.toBe( live );
	} );

	it( 'snapshots nothing while the canvas has no root', async () => {
		const { setCheckpoint, getCheckpoint } = await loadCheckpoints();
		editorBlocks().resolveBlocksRoot.mockReturnValue( null );

		setCheckpoint( 'call-1', [ 'blocks' ] );

		expect( getCheckpoint( 'call-1' )?.blocksBeforeUpdate ).toBeUndefined();
	} );

	// The root is resolved again: its clientId does not survive the editor remounting.
	it( 'puts the blocks back under the root as it is now, outside the undo stack', async () => {
		const { setCheckpoint, restoreCheckpoint } = await loadCheckpoints();
		editorBlocks().getRootBlocks.mockReturnValueOnce( page( 2 ) );
		setCheckpoint( 'call-1', [ 'blocks' ] );
		editorBlocks().resolveBlocksRoot.mockReturnValue( {
			kind: 'post-content',
			clientId: 'pc-remounted',
		} );
		editorBlocks().getRootBlocks.mockReturnValue( page( 3 ) );

		await restoreCheckpoint( 'call-1' );

		expect( editorBlocks().stageRootBlocks ).toHaveBeenCalledWith( 'pc-remounted', page( 2 ) );
	} );

	it.each( [
		{
			case: 'another page',
			root: { kind: 'post-content', clientId: 'pc' },
			post: { id: 8, type: 'page' },
		},
		{
			case: 'a view showing another root',
			root: { kind: 'section', clientId: 's' },
			post: { id: 7, type: 'page' },
		},
		{ case: 'a canvas with no root', root: null, post: { id: 7, type: 'page' } },
	] )( 'refuses to restore into $case', async ( { root, post } ) => {
		const { setCheckpoint, restoreCheckpoint } = await loadCheckpoints();
		setCheckpoint( 'call-1', [ 'blocks' ] );
		editorBlocks().resolveBlocksRoot.mockReturnValue( root );
		editorBlocks().getCurrentPost.mockReturnValue( post );

		await expect( restoreCheckpoint( 'call-1' ) ).rejects.toThrow( 'another page or view' );
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

	it( 'rejects when the snapshot is missing', async () => {
		const { setCheckpoint, restoreCheckpoint, getCheckpoint } = await loadCheckpoints();
		setCheckpoint( 'call-1', [ 'blocks' ] );
		delete getCheckpoint( 'call-1' )?.blocksBeforeUpdate;

		await expect( restoreCheckpoint( 'call-1' ) ).rejects.toThrow( 'no blocks snapshot' );
	} );

	// The redo puts back the page as the undo is about to overwrite it.
	it( 'records the current blocks in the reciprocal', async () => {
		const { setReciprocalCheckpoint, getCheckpoint } = await loadCheckpoints();
		editorBlocks().getRootBlocks.mockReturnValue( page( 2 ) );

		await setReciprocalCheckpoint(
			'redo',
			{
				id: 'target',
				checkpointKeys: [ 'blocks' ],
				createdAt: 0,
				blocksBeforeUpdate: {
					rootKind: 'post-content',
					blocks: page( 1 ),
					post: { id: 7, type: 'page' },
				},
			} as never,
			{}
		);

		expect( getCheckpoint( 'redo' )?.blocksBeforeUpdate ).toEqual( {
			rootKind: 'post-content',
			blocks: page( 2 ),
			post: { id: 7, type: 'page' },
		} );
	} );

	it( 'refuses a reciprocal from another page', async () => {
		const { setReciprocalCheckpoint, getCheckpoint } = await loadCheckpoints();
		editorBlocks().getCurrentPost.mockReturnValue( { id: 8, type: 'page' } );

		await expect(
			setReciprocalCheckpoint(
				'redo',
				{
					id: 'target',
					checkpointKeys: [ 'blocks' ],
					createdAt: 0,
					blocksBeforeUpdate: {
						rootKind: 'post-content',
						blocks: [],
						post: { id: 7, type: 'page' },
					},
				} as never,
				{}
			)
		).rejects.toThrow( 'another page or view' );
		expect( getCheckpoint( 'redo' ) ).toBeUndefined();
	} );

	it( 'keeps the snapshot out of the model-facing list', async () => {
		const { setCheckpoint, getAvailableCheckpoints } = await loadCheckpoints();
		setCheckpoint( 'call-1', [ 'blocks' ] );

		expect( getAvailableCheckpoints()[ 0 ] ).not.toHaveProperty( 'blocksBeforeUpdate' );
	} );
} );

describe( 'restore order', () => {
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
