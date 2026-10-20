/**
 * @jest-environment jsdom
 */
import { getPromptSource, takePromptSource } from '../prompt-source';
import {
	isSiteSetupChat,
	isSiteSetupChecklistEnabled,
	toChecklistItems,
} from '../site-setup-checklist';
import type { SiteSetupTask } from '../site-setup-tasks';
import type { UIMessage } from '@automattic/agenttic-client';

type WindowWithInlineData = Window & { agentsManagerData?: { siteSetupChecklist?: boolean } };

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
		delete ( window as WindowWithInlineData ).agentsManagerData;
		window.history.replaceState( null, '', '/' );
	} );

	it( 'is off without the flag', () => {
		expect( isSiteSetupChecklistEnabled() ).toBe( false );
	} );

	it( 'follows the host flag', () => {
		( window as WindowWithInlineData ).agentsManagerData = { siteSetupChecklist: true };
		expect( isSiteSetupChecklistEnabled() ).toBe( true );
	} );

	it( 'accepts the dev toggle in the query string', () => {
		window.history.replaceState( null, '', '/?am_setup_checklist=1' );
		expect( isSiteSetupChecklistEnabled() ).toBe( true );
	} );

	it( 'is off outside the editor even with the flag', () => {
		setEditorPage( false );
		( window as WindowWithInlineData ).agentsManagerData = { siteSetupChecklist: true };
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

	it( 'declares the prompt source for the task prompt before it is sent', async () => {
		const [ item ] = toChecklistItems( TASKS, new Set() );

		expect( await item.action?.() ).toBe( true );

		takePromptSource( item.prompt as string );
		expect( getPromptSource() ).toBe( 'site-setup-checklist' );
	} );
} );

describe( 'isSiteSetupChat', () => {
	const message = ( role: 'user' | 'agent', promptSource?: string ): UIMessage => ( {
		id: role,
		role,
		timestamp: 0,
		archived: false,
		showIcon: false,
		content: [
			{ type: 'text', text: 'hi' },
			...( promptSource ? [ { type: 'data' as const, data: { promptSource } } ] : [] ),
		],
	} );

	it( 'is true when a user message carries the checklist prompt source', () => {
		expect(
			isSiteSetupChat( [ message( 'user', 'site-setup-checklist' ), message( 'agent' ) ] )
		).toBe( true );
	} );

	it( 'ignores other sources, agent messages and plain chats', () => {
		expect( isSiteSetupChat( [ message( 'user', 'background' ) ] ) ).toBe( false );
		expect( isSiteSetupChat( [ message( 'agent', 'site-setup-checklist' ) ] ) ).toBe( false );
		expect( isSiteSetupChat( [ message( 'user' ) ] ) ).toBe( false );
	} );
} );
