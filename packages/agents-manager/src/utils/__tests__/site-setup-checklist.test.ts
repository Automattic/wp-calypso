/**
 * @jest-environment jsdom
 */
import { consumePromptSource } from '../prompt-source';
import {
	isChatStartedFromSiteSetup,
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
	const startTask = jest.fn( async () => {} );

	beforeEach( () => {
		startTask.mockClear();
	} );

	it( 'maps tasks to auto-submitting items with the server’s status', () => {
		const items = toChecklistItems( TASKS, startTask );

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

	it( 'declares where the task prompt comes from before it is sent', async () => {
		const [ item ] = toChecklistItems( TASKS, startTask );

		expect( await item.action?.() ).toBe( true );
		expect( consumePromptSource( item.prompt as string ) ).toEqual( {
			source: 'site-setup-checklist',
			id: 'design',
		} );
	} );

	it( 'records a picked to-do task as started before its prompt is sent', async () => {
		const [ item ] = toChecklistItems( TASKS, startTask );

		await item.action?.();

		expect( startTask ).toHaveBeenCalledWith( TASKS[ 0 ] );
	} );

	it.each( [
		[ 'done', 1 ],
		[ 'in-progress', 3 ],
	] )( 'does not start a task the server already has as %s', async ( _status, index ) => {
		const items = toChecklistItems( TASKS, startTask );

		expect( await items[ index ].action?.() ).toBe( true );
		expect( startTask ).not.toHaveBeenCalled();
	} );
} );

describe( 'isChatStartedFromSiteSetup', () => {
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

	it( 'is true once a user message came from the checklist, live or restored', () => {
		expect(
			isChatStartedFromSiteSetup( [
				message( 'user' ),
				message( 'agent' ),
				message( 'user', checklist( 'about' ) ),
			] )
		).toBe( true );
	} );

	it( 'still marks the chat as started when the stored message has no task id', () => {
		expect( isChatStartedFromSiteSetup( [ message( 'user', checklist() ) ] ) ).toBe( true );
	} );

	it( 'is false for other sources, agent messages and plain chats', () => {
		expect(
			isChatStartedFromSiteSetup( [ message( 'user', { promptSource: 'background' } ) ] )
		).toBe( false );
		expect( isChatStartedFromSiteSetup( [ message( 'agent', checklist( 'theme' ) ) ] ) ).toBe(
			false
		);
		expect( isChatStartedFromSiteSetup( [ message( 'user' ) ] ) ).toBe( false );
	} );
} );
