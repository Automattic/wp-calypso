/**
 * @jest-environment jsdom
 */
jest.mock( '@wordpress/core-data', () => ( { store: 'core' } ) );
// Reached through the checkpoint engine's tool-call lookup.
jest.mock( '@automattic/agenttic-client', () => ( { getAgentManager: jest.fn() } ), {
	virtual: true,
} );
jest.mock( '@wordpress/data', () => ( {
	dispatch: jest.fn(),
	resolveSelect: jest.fn(),
	select: jest.fn(),
} ) );
jest.mock( '../../../utils/is-editor-page', () => ( { isEditorPage: jest.fn( () => true ) } ) );
jest.mock( '../../../utils/navigation-menu', () => ( {
	MENU_FIELDS: [ 'blocks', 'content' ],
	addNavigationItem: jest.fn( async () => [] ),
	getMenuIdsToRelabel: jest.fn( async () => [ 10 ] ),
	// The checkpoint recorder snapshots and discards menus through these.
	isSameMenuId: ( a: unknown, b: unknown ) => String( a ) === String( b ),
	readMenuItems: jest.fn( async () => [] ),
	removeNavigationItem: jest.fn( async () => [] ),
	renameNavigationItem: jest.fn(),
} ) );
jest.mock( '../../../utils/page-title', () => ( {
	getPageTitle: jest.fn( async () => 'About' ),
	getPageUrl: jest.fn( async () => '/about/' ),
	getSavedPageTitle: jest.fn( async () => 'About' ),
	setPageTitle: jest.fn(),
} ) );
jest.mock( '../../../utils/session-log', () => ( {
	logSiteMetadata: jest.fn(),
	logSiteSession: jest.fn(),
} ) );
// The getters are what the checkpoint engine reads to snapshot these domains.
jest.mock( '../../../utils/site-metadata', () => ( {
	getSiteMetadata: jest.fn( () => ( { existing: true } ) ),
	setSiteMetadata: jest.fn( ( changes ) => ( { existing: true, ...changes } ) ),
} ) );
jest.mock( '../../../utils/site-title', () => ( {
	getSiteTitle: jest.fn( () => 'Old Site' ),
	setSiteTitle: jest.fn(),
} ) );
jest.mock( '../navigation-items', () => ( {
	buildNavigationItems: jest.fn( async ( _id, record ) => record ),
	checkMenuRecord: jest.fn(),
} ) );
jest.mock( '../../../utils/site-record', () => ( {
	getSiteRecord: jest.fn( () => ( { show_on_front: 'page', page_on_front: 3 } ) ),
} ) );
jest.mock( '../../../utils/editor-history', () => ( {
	getEditorHistory: jest.fn( () => ( {} ) ),
} ) );
jest.mock( '../../../utils/canvas-guard', () => ( {
	bindToEditorPath: jest.fn( () => jest.fn() ),
} ) );
jest.mock( '../../editor-navigate/callback', () => ( {
	PAGES_LIST_PATH: 'all-pages',
	navigateEditorWithoutSaving: jest.fn( async () => ( { result: { success: true } } ) ),
} ) );

import { dispatch, resolveSelect, select } from '@wordpress/data';
import { bindToEditorPath } from '../../../utils/canvas-guard';
import { checkpointKeys, getCheckpoint, hasCheckpoint } from '../../../utils/checkpoints';
import { getEditorHistory } from '../../../utils/editor-history';
import { isEditorPage } from '../../../utils/is-editor-page';
import {
	addNavigationItem,
	getMenuIdsToRelabel,
	readMenuItems,
	removeNavigationItem,
	renameNavigationItem,
} from '../../../utils/navigation-menu';
import {
	getPageTitle,
	getPageUrl,
	getSavedPageTitle,
	setPageTitle,
} from '../../../utils/page-title';
import { logSiteMetadata, logSiteSession } from '../../../utils/session-log';
import { setSiteMetadata } from '../../../utils/site-metadata';
import { getSiteRecord } from '../../../utils/site-record';
import { setSiteTitle } from '../../../utils/site-title';
import { navigateEditorWithoutSaving } from '../../editor-navigate/callback';
import { editEntityRecordCallback, getCheckpointKeys } from '../callback';
import { buildNavigationItems, checkMenuRecord } from '../navigation-items';

const saveEntityRecord = jest.fn( async () => ( { id: 7, title: 'About', link: '/about/' } ) );
const editEntityRecord = jest.fn();
const deleteEntityRecord = jest.fn();

const page = ( recordId?: number ) => ( {
	entityType: 'postType',
	entityName: 'page',
	...( recordId ? { recordId } : {} ),
} );

const menu = ( recordId?: number ) => ( {
	entityType: 'postType',
	entityName: 'wp_navigation',
	...( recordId ? { recordId } : {} ),
} );

const site = { entityType: 'root', entityName: 'site' };

beforeEach( () => {
	jest.clearAllMocks();
	( select as jest.Mock ).mockReturnValue( undefined );
	( isEditorPage as jest.Mock ).mockReturnValue( true );
	( dispatch as jest.Mock ).mockReturnValue( {
		saveEntityRecord,
		editEntityRecord,
		deleteEntityRecord,
	} );
	( resolveSelect as jest.Mock ).mockReturnValue( {
		getEditedEntityRecord: jest.fn().mockResolvedValue( {} ),
	} );
} );

describe( 'getCheckpointKeys', () => {
	it.each( [
		{
			case: 'a page rename, which moves the menu with it',
			input: { editEntities: [ { ...page( 7 ), record: { title: 'About us' } } ] },
			expected: [ checkpointKeys.PAGE, checkpointKeys.NAVIGATION ],
		},
		{
			// Only the title is restorable on a page, so an edit that leaves it
			// alone has no domain to put back.
			case: 'a page edit that changes only content',
			input: { editEntities: [ { ...page( 7 ), record: { content: 'Hello' } } ] },
			expected: [],
		},
		{
			case: 'a menu write',
			input: {
				editEntities: [
					{
						entityType: 'postType',
						entityName: 'wp_navigation',
						recordId: 9,
						record: { navigationItems: [] },
					},
				],
			},
			expected: [ checkpointKeys.NAVIGATION ],
		},
		{
			// The snapshot covers the menu items, so a title-only edit has nothing
			// it could put back and keeps the editor's undo instead.
			case: 'a menu record that changes only its own title',
			input: {
				editEntities: [
					{
						entityType: 'postType',
						entityName: 'wp_navigation',
						recordId: 9,
						record: { title: 'Header' },
					},
				],
			},
			expected: [],
		},
		{
			case: 'site metadata',
			input: {
				editEntities: [
					{
						entityType: 'root',
						entityName: 'site',
						recordId: 'big_sky_site_metadata',
						record: { personality: 'playful' },
					},
				],
			},
			expected: [ checkpointKeys.SITE_METADATA ],
		},
		{
			case: 'the site title, which is mirrored into the metadata',
			input: {
				editEntities: [
					{
						entityType: 'root',
						entityName: 'site',
						recordId: 'site_title',
						record: { title: 'Blue Harbor' },
					},
				],
			},
			expected: [ checkpointKeys.SITE_TITLE, checkpointKeys.SITE_METADATA ],
		},
		{
			// The agent does not reliably send the sentinel, so the record it
			// carries is what decides.
			case: 'a site title sent without the sentinel recordId',
			input: {
				editEntities: [
					{ entityType: 'root', entityName: 'site', recordId: 1, record: { title: 'Blue Harbor' } },
				],
			},
			expected: [ checkpointKeys.SITE_TITLE, checkpointKeys.SITE_METADATA ],
		},
		{ case: 'nothing at all', input: {}, expected: [] },
		// A restore rewrites records that already existed. It cannot remove a
		// created page or bring back a deleted one, so neither claims a domain
		// — a checkpoint for either would be an undo that does nothing.
		{
			case: 'a creation, which no restore can remove',
			input: { addEntities: [ { entityType: 'postType', entityName: 'page' } ] },
			expected: [],
		},
		{
			case: 'a deletion, which no restore can bring back',
			input: { deleteEntities: [ page( 7 ) ] },
			expected: [],
		},
	] )( 'claims the domains for $case', ( { input, expected } ) => {
		expect( getCheckpointKeys( ( input.editEntities ?? [] ) as never ).sort() ).toEqual(
			expected.sort()
		);
	} );
} );

describe( 'editEntityRecordCallback', () => {
	it( 'refuses when the editor is not open', async () => {
		( isEditorPage as jest.Mock ).mockReturnValue( false );

		const result = await editEntityRecordCallback( { editEntities: [ page( 7 ) ] } );

		expect( result.result.success ).toBe( false );
		expect( editEntityRecord ).not.toHaveBeenCalled();
	} );

	// The guard the backend asks for before anything destructive.
	it( 'writes nothing while a confirmation is outstanding', async () => {
		const result = await editEntityRecordCallback( {
			deleteEntities: [ page( 7 ) ],
			confirmationMessage: 'Delete the About page?',
		} );

		expect( result.result.success ).toBe( false );
		expect( result.result.message ).toBe( 'Delete the About page?' );
		expect( result.result.error ).toContain( 'no confirmationMessage' );
		expect( deleteEntityRecord ).not.toHaveBeenCalled();
		expect( removeNavigationItem ).not.toHaveBeenCalled();
	} );

	it( 'applies the delete once the confirmation is gone', async () => {
		await editEntityRecordCallback( { deleteEntities: [ page( 7 ) ] } );

		expect( deleteEntityRecord ).toHaveBeenCalled();
	} );

	it( 'creates a page and puts it in the menu', async () => {
		const result = await editEntityRecordCallback( {
			addEntities: [ { ...page(), record: { title: 'About', status: 'publish' } } ],
		} );

		expect( saveEntityRecord ).toHaveBeenCalled();
		expect( addNavigationItem ).toHaveBeenCalledWith( {
			label: 'About',
			id: 7,
			url: '/about/',
		} );
		expect( result.result.details ).toMatchObject( { created: [ { recordId: 7 } ] } );
	} );

	it( 'renames a page and relabels its menu item', async () => {
		await editEntityRecordCallback( {
			editEntities: [ { ...page( 7 ), record: { title: 'About us' } } ],
		} );

		// The title is checkpointed, so it goes through `setPageTitle` and stays
		// out of the editor's undo stack.
		expect( setPageTitle ).toHaveBeenCalledWith( 7, 'About us' );
		expect( renameNavigationItem ).toHaveBeenCalledWith( 7, 'About us', [ 'About' ], '/about/' );
	} );

	// The item may carry a label the user chose, which only the menu records.
	// Without the snapshot the undo would put the page's old title there.
	it( 'snapshots the menus before a rename overwrites their labels', async () => {
		await editEntityRecordCallback( {
			toolCallId: 'call-rename',
			editEntities: [ { ...page( 7 ), record: { title: 'About us' } } ],
		} );

		// Asked for the menus holding the page, and before the relabel: what the
		// recorder then stores is covered in the checkpoint suite.
		expect( getMenuIdsToRelabel ).toHaveBeenCalledWith( 7, [ 'About' ], '/about/' );
		expect( ( getMenuIdsToRelabel as jest.Mock ).mock.invocationCallOrder[ 0 ] ).toBeLessThan(
			( renameNavigationItem as jest.Mock ).mock.invocationCallOrder[ 0 ]
		);
	} );

	// A menu that cannot be read stops the rename, and a snapshot of a menu the
	// rename never touched would let an undo overwrite the user's edits there.
	it( 'discards the menu snapshots it took when a later menu cannot be read', async () => {
		( getMenuIdsToRelabel as jest.Mock ).mockResolvedValueOnce( [ 10, 11 ] );
		( readMenuItems as jest.Mock ).mockResolvedValueOnce( [] ).mockResolvedValueOnce( null );

		const result = await editEntityRecordCallback( {
			toolCallId: 'call-rename-unreadable-menu',
			editEntities: [ { ...page( 7 ), record: { title: 'About us' } } ],
		} );

		expect( result.result.success ).toBe( false );
		expect( renameNavigationItem ).not.toHaveBeenCalled();
		expect( getCheckpoint( 'call-rename-unreadable-menu' )?.menusBeforeUpdate ).toEqual( [] );
	} );

	// The rename reads every menu before writing any, so one that fails changed
	// nothing; its snapshots would only let an undo overwrite later user edits.
	it( 'discards the menu snapshots it took when the rename fails', async () => {
		( readMenuItems as jest.Mock ).mockResolvedValueOnce( [] );
		( renameNavigationItem as jest.Mock ).mockRejectedValueOnce( new Error( 'menu is locked' ) );

		const result = await editEntityRecordCallback( {
			toolCallId: 'call-rename-failed',
			editEntities: [ { ...page( 7 ), record: { title: 'About us' } } ],
		} );

		expect( result.result.success ).toBe( false );
		expect( getCheckpoint( 'call-rename-failed' )?.menusBeforeUpdate ).toEqual( [] );
	} );

	it( 'leaves the menu alone when the title is unchanged', async () => {
		await editEntityRecordCallback( {
			editEntities: [ { ...page( 7 ), record: { title: 'About' } } ],
		} );

		expect( renameNavigationItem ).not.toHaveBeenCalled();
	} );

	// A menu label follows the saved title until the page's own edit is saved,
	// so both titles travel with the rename.
	it( 'relabels by the saved title too when the one on screen is an unsaved edit', async () => {
		( getPageTitle as jest.Mock ).mockResolvedValue( 'About (draft)' );

		await editEntityRecordCallback( {
			editEntities: [ { ...page( 7 ), record: { title: 'About us' } } ],
		} );

		expect( renameNavigationItem ).toHaveBeenCalledWith(
			7,
			'About us',
			[ 'About (draft)', 'About' ],
			'/about/'
		);
	} );

	// The url travels with the removal: an item carrying no page id is matched
	// by it.
	// The user's unsaved menu edits are theirs to save; the item waits with
	// them, and the reply says so rather than leaving it to the model.
	it( 'tells the user when the menu item waits with their unsaved edits', async () => {
		( addNavigationItem as jest.Mock ).mockResolvedValueOnce( [ 10 ] );

		const result = await editEntityRecordCallback( {
			addEntities: [ { ...page(), record: { title: 'About' } } ],
		} );

		expect( result.result.success ).toBe( true );
		expect( result.result.message ).toContain( 'unsaved changes' );
		expect( result.result.details ).toMatchObject( { unsavedMenus: [ 10 ] } );
	} );

	it( 'deletes a page and removes its menu item', async () => {
		await editEntityRecordCallback( { deleteEntities: [ page( 7 ) ] } );

		expect( removeNavigationItem ).toHaveBeenCalledWith( 7, '/about/' );
		// The options go in the fifth argument: the fourth is the request's query
		// args, where `throwOnError` would be ignored.
		expect( deleteEntityRecord ).toHaveBeenCalledWith( 'postType', 'page', 7, undefined, {
			throwOnError: true,
		} );
	} );

	// A menu edit then snapshots the menu as the deletion left it, so undoing
	// the edit cannot bring back a link to a page that is gone.
	it( 'deletes before it edits', async () => {
		await editEntityRecordCallback( {
			deleteEntities: [ page( 7 ) ],
			editEntities: [ { ...page( 8 ), record: { content: 'Hello' } } ],
		} );

		expect( deleteEntityRecord.mock.invocationCallOrder[ 0 ] ).toBeLessThan(
			editEntityRecord.mock.invocationCallOrder[ 0 ]
		);
	} );

	describe( 'deleting the record on screen', () => {
		const open = ( type: string, id: number ) =>
			( select as jest.Mock ).mockReturnValue( {
				getCurrentPostType: () => type,
				getCurrentPostId: () => id,
			} );

		beforeEach( () => open( 'page', 7 ) );

		// Deleting it under the canvas would leave the editor on a page that no
		// longer exists, so the editor is routed to the front page first.
		it( 'leaves for the front page before deleting', async () => {
			await editEntityRecordCallback( { deleteEntities: [ page( 7 ) ] } );

			expect( navigateEditorWithoutSaving ).toHaveBeenCalledWith( '/page/3' );
			expect(
				( navigateEditorWithoutSaving as jest.Mock ).mock.invocationCallOrder[ 0 ]
			).toBeLessThan( deleteEntityRecord.mock.invocationCallOrder[ 0 ] );
		} );

		it.each( [
			// `page_on_front` lingers after a site switches to showing posts.
			{ case: 'the posts index', site: { show_on_front: 'posts', page_on_front: 3 } },
			{ case: 'the page being deleted', site: { show_on_front: 'page', page_on_front: 7 } },
		] )( 'leaves for the pages list when the front page is $case', async ( { site } ) => {
			( getSiteRecord as jest.Mock ).mockReturnValueOnce( site );

			await editEntityRecordCallback( { deleteEntities: [ page( 7 ) ] } );

			expect( navigateEditorWithoutSaving ).toHaveBeenCalledWith( 'all-pages' );
		} );

		// The navigation runs outside the guarded dispatch, so the binding must be
		// handed over here or the chat aborts the request as the user leaving.
		it( 'hands the canvas binding to the navigation first', async () => {
			await editEntityRecordCallback( { deleteEntities: [ page( 7 ) ] } );

			expect( bindToEditorPath ).toHaveBeenCalledWith( '/page/3' );
			expect( ( bindToEditorPath as jest.Mock ).mock.invocationCallOrder[ 0 ] ).toBeLessThan(
				( navigateEditorWithoutSaving as jest.Mock ).mock.invocationCallOrder[ 0 ]
			);
			expect( ( bindToEditorPath as jest.Mock ).mock.results[ 0 ].value ).not.toHaveBeenCalled();
		} );

		// Without the site editor's router the only way out is a full page load,
		// which could cut the delete request off mid-flight.
		it( 'refuses without a router to leave by', async () => {
			( getEditorHistory as jest.Mock ).mockReturnValueOnce( undefined );

			const result = await editEntityRecordCallback( { deleteEntities: [ page( 7 ) ] } );

			expect( result.result.error ).toContain( 'cannot leave it first' );
			expect( navigateEditorWithoutSaving ).not.toHaveBeenCalled();
			expect( deleteEntityRecord ).not.toHaveBeenCalled();
		} );

		// The post editor opens posts too, and has no router to leave by.
		it( 'refuses to delete the post open in the post editor', async () => {
			open( 'post', 7 );
			( getEditorHistory as jest.Mock ).mockReturnValueOnce( undefined );

			const result = await editEntityRecordCallback( {
				deleteEntities: [ { entityType: 'postType', entityName: 'post', recordId: 7 } ],
			} );

			expect( result.result.error ).toContain( 'Cannot delete post 7' );
			expect( deleteEntityRecord ).not.toHaveBeenCalled();
		} );

		// The route may have changed by the time the navigation reports a
		// failure; rebinding the source page then would read the arrival as the
		// user leaving.
		it( 'keeps the destination binding when the navigation fired but did not settle', async () => {
			( navigateEditorWithoutSaving as jest.Mock ).mockResolvedValueOnce( {
				result: { success: false, error: 'did not finish', details: { navigated: true } },
			} );

			await editEntityRecordCallback( { deleteEntities: [ page( 7 ) ] } );

			expect( ( bindToEditorPath as jest.Mock ).mock.results[ 0 ].value ).not.toHaveBeenCalled();
			expect( deleteEntityRecord ).not.toHaveBeenCalled();
		} );

		it( 'does not delete when it cannot leave', async () => {
			( navigateEditorWithoutSaving as jest.Mock ).mockResolvedValueOnce( {
				result: { success: false, error: 'the editor is busy' },
			} );

			const result = await editEntityRecordCallback( { deleteEntities: [ page( 7 ) ] } );

			expect( result.result.error ).toContain( 'the editor is busy' );
			expect( deleteEntityRecord ).not.toHaveBeenCalled();
			expect( ( bindToEditorPath as jest.Mock ).mock.results[ 0 ].value ).toHaveBeenCalled();
		} );

		it( 'stays put when deleting a different page', async () => {
			await editEntityRecordCallback( { deleteEntities: [ page( 8 ) ] } );

			expect( navigateEditorWithoutSaving ).not.toHaveBeenCalled();
		} );
	} );

	// The menu write persists, so removing the item before the delete would
	// strip it for good on a page that then survived.
	it( 'leaves the menu item alone when the delete fails', async () => {
		deleteEntityRecord.mockRejectedValueOnce( new Error( 'page is locked' ) );

		const result = await editEntityRecordCallback( { deleteEntities: [ page( 7 ) ] } );

		expect( result.result.success ).toBe( false );
		expect( removeNavigationItem ).not.toHaveBeenCalled();
	} );

	it( 'writes site metadata and logs it', async () => {
		await editEntityRecordCallback( {
			editEntities: [
				{
					entityType: 'root',
					entityName: 'site',
					recordId: 'big_sky_site_metadata',
					record: { personality: 'bold' },
				},
			],
		} );

		expect( setSiteMetadata ).toHaveBeenCalledWith( { personality: 'bold' } );
		expect( logSiteMetadata ).toHaveBeenCalledWith( { existing: true, personality: 'bold' } );
		expect( logSiteSession ).not.toHaveBeenCalled();
	} );

	// The site title lives on the record and is mirrored into the metadata,
	// which is also what names the session.
	it( 'writes the site title to both the record and the metadata', async () => {
		await editEntityRecordCallback( {
			editEntities: [
				{
					entityType: 'root',
					entityName: 'site',
					recordId: 'site_title',
					record: { title: 'My Site' },
				},
			],
		} );

		expect( setSiteTitle ).toHaveBeenCalledWith( 'My Site' );
		expect( setSiteMetadata ).toHaveBeenCalledWith( { siteTitle: 'My Site' } );
		expect( logSiteSession ).toHaveBeenCalledWith( 'My Site' );
	} );

	// A batch that creates a page then fails must not have the agent create it
	// again, so the failure carries what already landed.
	it( 'refuses a batch with nothing in it', async () => {
		const result = await editEntityRecordCallback( {} );

		expect( result.result.success ).toBe( false );
		expect( result.result.error ).toContain( 'Nothing to do' );
	} );

	// `root/page` passes the schema, whose two enums are independent.
	it( 'refuses an entity kind and name that do not go together', async () => {
		const result = await editEntityRecordCallback( {
			editEntities: [
				{ entityType: 'root', entityName: 'page', recordId: 7, record: { title: 'About' } },
			],
		} );

		expect( result.result.success ).toBe( false );
		expect( result.result.error ).toContain( 'Unsupported entity: root/page' );
	} );

	// `editEntityRecord()` reads the persisted record to tell a real change from
	// a no-op, and throws on one that was never fetched.
	it( 'refuses a record it cannot read', async () => {
		( resolveSelect as jest.Mock ).mockReturnValue( {
			getEditedEntityRecord: jest.fn().mockResolvedValue( undefined ),
		} );

		const result = await editEntityRecordCallback( {
			editEntities: [ { ...page( 7 ), record: { content: 'Hello' } } ],
		} );

		expect( result.result.success ).toBe( false );
		expect( result.result.error ).toContain( 'Cannot edit page 7' );
		expect( editEntityRecord ).not.toHaveBeenCalled();
	} );

	// Creating and deleting take posts and pages only, and nothing validates the
	// raw arguments: `root/site` would rewrite the real settings, and a menu
	// delete would take every item with it.
	it.each( [
		{
			case: 'a site record created',
			input: { addEntities: [ { ...site, record: { title: 'My Site' } } ] },
			error: 'Cannot create root/site',
		},
		{
			case: 'a site record deleted',
			input: { deleteEntities: [ { ...site, recordId: 1 } ] },
			error: 'Cannot delete root/site',
		},
		{
			case: 'a menu created',
			input: { addEntities: [ { ...menu( 9 ), record: { title: 'Main' } } ] },
			error: 'Cannot create postType/wp_navigation',
		},
		{
			case: 'a menu deleted',
			input: { deleteEntities: [ menu( 9 ) ] },
			error: 'Cannot delete postType/wp_navigation',
		},
	] )( 'refuses $case', async ( { input, error } ) => {
		const result = await editEntityRecordCallback( input );

		expect( result.result.success ).toBe( false );
		expect( result.result.error ).toContain( error );
		expect( saveEntityRecord ).not.toHaveBeenCalled();
		expect( deleteEntityRecord ).not.toHaveBeenCalled();
	} );

	// The callback runs on raw arguments, so an entry skipped for missing fields
	// would write nothing and still be reported as applied.
	it.each( [
		{ case: 'create', input: { addEntities: [ {} ] }, error: 'Cannot create:' },
		{ case: 'edit', input: { editEntities: [ page( 7 ) ] }, error: 'Cannot edit:' },
		{ case: 'delete', input: { deleteEntities: [ page() ] }, error: 'Cannot delete:' },
	] )( 'refuses a $case entry missing required fields', async ( { input, error } ) => {
		const result = await editEntityRecordCallback( input );

		expect( result.result.success ).toBe( false );
		expect( result.result.error ).toContain( error );
	} );

	// Field types too: an array record would spread into numeric metadata keys,
	// and a string one would throw inside the checkpoint-key lookup.
	it.each( [
		{ case: 'a string record', input: { editEntities: [ { ...page( 7 ), record: 'x' } ] } },
		{
			case: 'an array record',
			input: { editEntities: [ { ...site, recordId: 1, record: [ 'x' ] } ] },
		},
		{ case: 'an object recordId', input: { deleteEntities: [ { ...page(), recordId: {} } ] } },
		{ case: 'string options', input: { deleteEntities: [ { ...page( 7 ), options: 'x' } ] } },
		{ case: 'a non-object entry', input: { addEntities: [ 'page' ] } },
		{
			case: 'a title that is not text',
			input: { editEntities: [ { ...page( 7 ), record: { title: {} } } ] },
		},
		{
			case: 'content that is not text',
			input: { editEntities: [ { ...page( 7 ), record: { content: 123 } } ] },
		},
		{
			case: 'a site location with a numeric name',
			input: {
				editEntities: [
					{ ...site, recordId: 'big_sky_site_metadata', record: { siteLocation: { name: 7 } } },
				],
			},
		},
		{
			case: 'a personality that is not text',
			input: {
				editEntities: [
					{ ...site, recordId: 'big_sky_site_metadata', record: { personality: {} } },
				],
			},
		},
	] )( 'refuses $case', async ( { input } ) => {
		const result = await editEntityRecordCallback( input as never );

		expect( result.result.success ).toBe( false );
		expect( result.result.error ).toMatch( /^Cannot (create|edit|delete):/ );
		expect( editEntityRecord ).not.toHaveBeenCalled();
		expect( deleteEntityRecord ).not.toHaveBeenCalled();
		expect( setSiteMetadata ).not.toHaveBeenCalled();
	} );

	it( 'refuses a payload that is not an object', async () => {
		const result = await editEntityRecordCallback( null as never );

		expect( result.result.success ).toBe( false );
		expect( result.result.error ).toContain( 'Invalid arguments' );
	} );

	it( 'refuses a confirmationMessage that is not a string', async () => {
		const result = await editEntityRecordCallback( {
			deleteEntities: [ page( 7 ) ],
			confirmationMessage: true as never,
		} );

		expect( result.result.error ).toContain( 'confirmationMessage' );
		expect( deleteEntityRecord ).not.toHaveBeenCalled();
	} );

	// A content-only edit records no checkpoint, so the editor's undo is its
	// only undo — not the request's to switch off.
	it( "keeps the agent's options out of an edit", async () => {
		await editEntityRecordCallback( {
			editEntities: [
				{ ...page( 8 ), record: { content: 'Hello' }, options: { undoIgnore: true } },
			],
		} );

		expect( editEntityRecord ).toHaveBeenCalledWith( 'postType', 'page', 8, { content: 'Hello' } );
	} );

	it( 'clears a page title sent as null, as the schema allows', async () => {
		await editEntityRecordCallback( {
			editEntities: [ { ...page( 7 ), record: { title: null } } ],
		} );

		expect( setPageTitle ).toHaveBeenCalledWith( 7, '' );
	} );

	it( 'refuses the whole batch before writing when any entry is malformed', async () => {
		const result = await editEntityRecordCallback( {
			addEntities: [ { ...page(), record: { title: 'About' } } ],
			editEntities: [ { ...page( 8 ), record: 'x' as never } ],
		} );

		expect( result.result.error ).toContain( 'Cannot edit:' );
		expect( saveEntityRecord ).not.toHaveBeenCalled();
	} );

	// The saved title and the permalink serve the menu relabel, so a read that
	// rejects must not block an edit that renames nothing.
	it( 'reads no menu context for an edit that renames nothing', async () => {
		await editEntityRecordCallback( {
			editEntities: [ { ...page( 8 ), record: { content: 'Hello' } } ],
		} );

		expect( getSavedPageTitle ).not.toHaveBeenCalled();
		expect( getPageUrl ).not.toHaveBeenCalled();
		expect( editEntityRecord ).toHaveBeenCalledWith( 'postType', 'page', 8, { content: 'Hello' } );
	} );

	// A misspelt field would otherwise be dropped and the rest reported as done.
	it( 'refuses a batch carrying a field the schema does not name', async () => {
		const result = await editEntityRecordCallback( {
			addEntities: [ { ...page(), record: { title: 'About' } } ],
			deleteEntites: [ page( 7 ) ],
		} as never );

		expect( result.result.success ).toBe( false );
		expect( result.result.error ).toContain( 'Unknown field: deleteEntites' );
		expect( saveEntityRecord ).not.toHaveBeenCalled();
	} );

	it( 'accepts every field the schema declares, and the ones agenttic-client adds', async () => {
		const result = await editEntityRecordCallback( {
			editEntities: [ { ...page( 8 ), record: { content: 'Hello' } } ],
			confirmationMessage: '',
			summary: 'Updated the page.',
			followUpTasks: [],
			messageId: 'm1',
			toolCallId: 'call-envelope',
			toolId: 'big_sky__edit_entity_record',
		} as never );

		expect( result.result.success ).toBe( true );
		expect( result.result.message ).toBe( 'Updated the page.' );
	} );

	// The create schema is closed: a misspelt title would create an untitled page.
	it( 'refuses a create whose record carries a field the schema does not name', async () => {
		const result = await editEntityRecordCallback( {
			addEntities: [ { ...page(), record: { titel: 'About' } } ],
		} as never );

		expect( result.result.success ).toBe( false );
		expect( result.result.error ).toContain( 'unknown field titel' );
		expect( saveEntityRecord ).not.toHaveBeenCalled();
	} );

	// Checked with the rest of the batch: found only when its turn came, a
	// malformed menu edit would fail after the creates before it had landed.
	it( 'refuses a malformed menu edit before anything is written', async () => {
		( checkMenuRecord as jest.Mock ).mockImplementationOnce( () => {
			throw new Error( 'Invalid navigation items at the top level' );
		} );

		const result = await editEntityRecordCallback( {
			addEntities: [ { ...page(), record: { title: 'About' } } ],
			editEntities: [
				{
					entityType: 'postType',
					entityName: 'wp_navigation',
					recordId: 9,
					record: { navigationItems: [ null ] },
				},
			],
		} as never );

		expect( result.result.success ).toBe( false );
		expect( result.result.error ).toContain( 'Invalid navigation items' );
		expect( saveEntityRecord ).not.toHaveBeenCalled();
	} );

	it( 'refuses an entry carrying a field the schema does not name', async () => {
		const result = await editEntityRecordCallback( {
			editEntities: [ { ...page( 8 ), record: { content: 'Hello' }, option: { force: true } } ],
		} as never );

		expect( result.result.success ).toBe( false );
		expect( result.result.error ).toContain( 'unknown field option' );
		expect( editEntityRecord ).not.toHaveBeenCalled();
	} );

	it( 'reports what applied when a later change fails', async () => {
		( setPageTitle as jest.Mock ).mockRejectedValueOnce( new Error( 'menu is locked' ) );

		const result = await editEntityRecordCallback( {
			addEntities: [ { ...page(), record: { title: 'About' } } ],
			editEntities: [ { ...page( 8 ), record: { title: 'Contact' } } ],
		} );

		expect( result.result.success ).toBe( false );
		expect( result.result.error ).toContain( 'menu is locked' );
		expect( result.result.details ).toMatchObject( { created: [ { recordId: 7 } ] } );
		expect( result.result.error ).toContain( 'do not repeat them' );
	} );

	// The undo has to reach back to before the call, not vanish with the error
	// — the writes that already landed are exactly what the user needs undone.
	it( 'keeps the checkpoint when restorable work landed before the failure', async () => {
		( setPageTitle as jest.Mock ).mockRejectedValueOnce( new Error( 'page is locked' ) );

		await editEntityRecordCallback( {
			toolCallId: 'call-partial',
			editEntities: [
				{ entityType: 'root', entityName: 'site', recordId: 1, record: { title: 'My Site' } },
				{ ...page( 8 ), record: { title: 'Contact' } },
			],
		} );

		expect( hasCheckpoint( 'call-partial' ) ).toBe( true );
	} );

	// The title persisted before the content write failed, so it needs the
	// checkpoint that undoes it — reporting nothing would take that down too.
	it( 'reports a rename that landed before a later write in the same record failed', async () => {
		editEntityRecord.mockRejectedValueOnce( new Error( 'content is locked' ) );

		const result = await editEntityRecordCallback( {
			toolCallId: 'call-rename-partial',
			editEntities: [ { ...page( 8 ), record: { title: 'Contact', content: 'Hello' } } ],
		} );

		expect( setPageTitle ).toHaveBeenCalledWith( 8, 'Contact' );
		// The fields say what landed: told only that the page was updated, a
		// retry would drop the content that was not.
		expect( result.result.details ).toMatchObject( {
			updated: [ { recordId: 8, fields: [ 'title' ] } ],
		} );
		expect( hasCheckpoint( 'call-rename-partial' ) ).toBe( true );
	} );

	// The menu write landed outside the editor's undo stack, so the checkpoint
	// is its only way back — a later failure must not take it down.
	it( 'reports a menu write that landed before a later write in the same record failed', async () => {
		( buildNavigationItems as jest.Mock ).mockResolvedValueOnce( { blocks: [], title: 'Header' } );
		editEntityRecord.mockResolvedValueOnce( undefined );
		editEntityRecord.mockRejectedValueOnce( new Error( 'title is locked' ) );

		const result = await editEntityRecordCallback( {
			toolCallId: 'call-menu-partial',
			editEntities: [
				{
					entityType: 'postType',
					entityName: 'wp_navigation',
					recordId: 9,
					record: { navigationItems: [], title: 'Header' },
				},
			],
		} );

		expect( result.result.details ).toMatchObject( {
			updated: [ { recordId: 9, fields: [ 'navigationItems' ] } ],
		} );
		expect( hasCheckpoint( 'call-menu-partial' ) ).toBe( true );
	} );

	// The creation landed, but nothing can un-create a page, so the checkpoint
	// holds nothing to restore and is dropped rather than offering an empty undo.
	it( 'drops the checkpoint when only unrestorable work landed', async () => {
		( setPageTitle as jest.Mock ).mockRejectedValueOnce( new Error( 'page is locked' ) );

		await editEntityRecordCallback( {
			toolCallId: 'call-created-only',
			addEntities: [ { ...page(), record: { title: 'About' } } ],
			editEntities: [ { ...page( 8 ), record: { title: 'Contact' } } ],
		} );

		expect( hasCheckpoint( 'call-created-only' ) ).toBe( false );
	} );

	it( 'drops the checkpoint when the batch changed nothing', async () => {
		( setPageTitle as jest.Mock ).mockRejectedValueOnce( new Error( 'menu is locked' ) );

		await editEntityRecordCallback( {
			toolCallId: 'call-nothing',
			editEntities: [ { ...page( 8 ), record: { title: 'Contact' } } ],
		} );

		expect( hasCheckpoint( 'call-nothing' ) ).toBe( false );
	} );
} );
