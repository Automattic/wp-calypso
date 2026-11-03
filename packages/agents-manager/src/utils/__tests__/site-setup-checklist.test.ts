/**
 * @jest-environment jsdom
 */
import { consumePromptSource } from '../prompt-source';
import {
	getLastPickedSiteSetupTask,
	getSiteSetupStartedTasks,
	isSiteSetupChecklistEnabled,
	toChecklistItems,
} from '../site-setup-checklist';
import type { SiteSetupTask } from '../site-setup-tasks';
import type { UIMessage } from '@automattic/agenttic-client';

const TASKS: SiteSetupTask[] = [
	{ id: 'design', title: 'Customize the design', status: 'todo', disabled: false },
	{ id: 'about', title: 'Publish the About page', status: 'done', disabled: false },
	{ id: 'domain', title: 'Add a custom domain', status: 'todo', disabled: true },
	{ id: 'images', title: 'Replace placeholder images', status: 'in-progress', disabled: false },
];

describe( 'isSiteSetupChecklistEnabled', () => {
	const setEditorPage = ( isEditor: boolean ) =>
		document.body.classList.toggle( 'site-editor-php', isEditor );

	beforeEach( () => {
		setEditorPage( true );
		window.history.replaceState( null, '', '/' );
	} );

	it( 'is off without the toggle', () => {
		expect( isSiteSetupChecklistEnabled() ).toBe( false );
	} );

	it( 'is on with the toggle in the query string', () => {
		window.history.replaceState( null, '', '/?am_setup_checklist=1' );
		expect( isSiteSetupChecklistEnabled() ).toBe( true );
	} );

	it( 'is off outside the editor even with the toggle', () => {
		setEditorPage( false );
		window.history.replaceState( null, '', '/?am_setup_checklist=1' );
		expect( isSiteSetupChecklistEnabled() ).toBe( false );
	} );
} );

describe( 'toChecklistItems', () => {
	it( 'maps tasks to auto-submitting items with a prompt', () => {
		const items = toChecklistItems( TASKS, new Set() );

		expect( items ).toEqual( [
			expect.objectContaining( {
				id: 'design',
				label: 'Customize the design',
				status: 'todo',
				prompt: 'Help me with this Site Setup task: Customize the design',
				autoSubmit: true,
				disabled: false,
			} ),
			expect.objectContaining( { id: 'about', status: 'done' } ),
			expect.objectContaining( { id: 'domain', status: 'todo', disabled: true } ),
			expect.objectContaining( { id: 'images', status: 'in-progress' } ),
		] );
	} );

	it( 'keeps a started task in progress until the server settles it', () => {
		const items = toChecklistItems( TASKS, new Set( [ 'design', 'about' ] ) );

		expect( items[ 0 ].status ).toBe( 'in-progress' );
		expect( items[ 1 ].status ).toBe( 'done' );
	} );

	it( 'declares where the task prompt comes from before it is sent', async () => {
		const [ item ] = toChecklistItems( TASKS, new Set() );

		expect( await item.action?.() ).toBe( true );
		expect( consumePromptSource( item.prompt as string ) ).toEqual( {
			source: 'site-setup-checklist',
			id: 'design',
		} );
	} );
} );

describe( 'getSiteSetupStartedTasks', () => {
	const message = (
		role: 'user' | 'agent',
		data?: { promptSource: string; promptSourceId?: string }
	): UIMessage => ( {
		id: `${ role }-${ data?.promptSourceId ?? '' }`,
		role,
		timestamp: 0,
		archived: false,
		showIcon: false,
		content: [
			{ type: 'text', text: 'hi' },
			...( data ? [ { type: 'data' as const, data } ] : [] ),
		],
	} );
	const checklist = ( promptSourceId?: string ) => ( {
		promptSource: 'site-setup-checklist',
		promptSourceId,
	} );

	it( 'names the tasks picked from the checklist, live or restored', () => {
		const started = getSiteSetupStartedTasks( [
			message( 'user', checklist( 'theme' ) ),
			message( 'agent' ),
			message( 'user', checklist( 'about' ) ),
			message( 'user', checklist( 'theme' ) ),
		] );

		expect( started && [ ...started ].sort() ).toEqual( [ 'about', 'theme' ] );
	} );

	it( 'still marks the chat as started when the stored message has no task id', () => {
		expect( getSiteSetupStartedTasks( [ message( 'user', checklist() ) ] )?.size ).toBe( 0 );
	} );

	it( 'names the task picked last, skipping messages without a task id', () => {
		expect(
			getLastPickedSiteSetupTask( [
				message( 'user', checklist( 'theme' ) ),
				message( 'user', checklist( 'about' ) ),
				message( 'user', checklist() ),
				message( 'agent' ),
			] )
		).toBe( 'about' );
		expect( getLastPickedSiteSetupTask( [ message( 'user', checklist() ) ] ) ).toBeNull();
		expect( getLastPickedSiteSetupTask( [ message( 'agent', checklist( 'theme' ) ) ] ) ).toBeNull();
	} );

	it( 'is null for other sources, agent messages and plain chats', () => {
		expect(
			getSiteSetupStartedTasks( [ message( 'user', { promptSource: 'background' } ) ] )
		).toBeNull();
		expect( getSiteSetupStartedTasks( [ message( 'agent', checklist( 'theme' ) ) ] ) ).toBeNull();
		expect( getSiteSetupStartedTasks( [ message( 'user' ) ] ) ).toBeNull();
	} );
} );
