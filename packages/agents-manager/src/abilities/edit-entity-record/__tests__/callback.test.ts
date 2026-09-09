/**
 * @jest-environment jsdom
 */
jest.mock( '@wordpress/core-data', () => ( { store: 'core' } ) );
// Reached through the checkpoint engine's tool-call lookup.
jest.mock( '@automattic/agenttic-client', () => ( { getAgentManager: jest.fn() } ), {
	virtual: true,
} );
jest.mock( '@wordpress/data', () => ( { dispatch: jest.fn(), resolveSelect: jest.fn() } ) );
jest.mock( '../../../utils/is-editor-page', () => ( { isEditorPage: jest.fn( () => true ) } ) );
jest.mock( '../../../utils/navigation-menu', () => ( {
	addNavigationItem: jest.fn(),
	removeNavigationItem: jest.fn(),
	renameNavigationItem: jest.fn(),
} ) );
jest.mock( '../../../utils/page-title', () => ( {
	getPageTitle: jest.fn( async () => 'About' ),
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
} ) );

import { dispatch, resolveSelect } from '@wordpress/data';
import { checkpointKeys, hasCheckpoint } from '../../../utils/checkpoints';
import { isEditorPage } from '../../../utils/is-editor-page';
import {
	addNavigationItem,
	removeNavigationItem,
	renameNavigationItem,
} from '../../../utils/navigation-menu';
import { setPageTitle } from '../../../utils/page-title';
import { logSiteMetadata, logSiteSession } from '../../../utils/session-log';
import { setSiteMetadata } from '../../../utils/site-metadata';
import { setSiteTitle } from '../../../utils/site-title';
import { editEntityRecordCallback, getCheckpointKeys } from '../callback';

const saveEntityRecord = jest.fn( async () => ( { id: 7, title: 'About', link: '/about/' } ) );
const editEntityRecord = jest.fn();
const deleteEntityRecord = jest.fn();

const page = ( recordId?: number ) => ( {
	entityType: 'postType',
	entityName: 'page',
	...( recordId ? { recordId } : {} ),
} );

beforeEach( () => {
	jest.clearAllMocks();
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
				editEntities: [ { entityType: 'postType', entityName: 'wp_navigation', recordId: 9 } ],
			},
			expected: [ checkpointKeys.NAVIGATION ],
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
		expect( getCheckpointKeys( input ).sort() ).toEqual( expected.sort() );
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
		expect( renameNavigationItem ).toHaveBeenCalledWith( 7, 'About us', 'About' );
	} );

	it( 'leaves the menu alone when the title is unchanged', async () => {
		await editEntityRecordCallback( {
			editEntities: [ { ...page( 7 ), record: { title: 'About' } } ],
		} );

		expect( renameNavigationItem ).not.toHaveBeenCalled();
	} );

	it( 'deletes a page and removes its menu item', async () => {
		await editEntityRecordCallback( { deleteEntities: [ page( 7 ) ] } );

		expect( removeNavigationItem ).toHaveBeenCalledWith( 7 );
		expect( deleteEntityRecord ).toHaveBeenCalledWith( 'postType', 'page', 7, {
			throwOnError: true,
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
