/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';

// The card's host, in place of the MCP host.
const host = vi.hoisted( () => ( {
	listeners: {} as Record< string, ( result: unknown ) => void >,
	callServerTool: undefined as unknown as Mock< ( ...args: unknown[] ) => Promise< unknown > >,
} ) );

vi.mock( '@modelcontextprotocol/ext-apps/app-with-deps', () => ( {
	App: class {
		addEventListener( name: string, listener: ( result: unknown ) => void ) {
			host.listeners[ name ] = listener;
		}
		connect() {
			return Promise.resolve();
		}
		callServerTool( ...args: unknown[] ) {
			return host.callServerTool( ...args );
		}
	},
} ) );
vi.mock( '../titles/style.scss', () => ( {} ) );

const RESULT = {
	version: 5,
	id: 's1',
	site: { id: 7, url: 'https://example.com' },
	post: { id: 42, title: 'Old <b>title</b>' },
	titles: [ 'First', 'Second <img src=x onerror=alert(1)>', 'Third' ],
};

const pills = () =>
	Array.from( document.querySelectorAll< HTMLButtonElement >( '.mcp-post-editor-titles__pill' ) );
const message = () => document.querySelector( '.mcp-post-editor-titles__message' );

async function showCard( result: unknown = { structuredContent: RESULT } ) {
	await import( '../titles' );
	host.listeners.toolresult( result );
}

describe( 'the title suggestions card', () => {
	beforeEach( () => {
		vi.resetModules();
		document.body.innerHTML = '<div id="mcp-post-editor-titles"><p>Loading</p></div>';
		host.callServerTool = vi.fn();
	} );

	it( 'shows the post title and a pill for each title, as text', async () => {
		await showCard();

		expect( document.querySelector( '.mcp-post-editor-titles__heading' )?.textContent ).toBe(
			'Title ideas for “Old <b>title</b>”'
		);
		expect( pills().map( ( pill ) => pill.textContent ) ).toEqual( RESULT.titles );
		expect( document.querySelector( 'img, b' ) ).toBeNull();
	} );

	it( 'reads the result from its text when it has no structured content', async () => {
		await showCard( { content: [ { type: 'text', text: JSON.stringify( RESULT ) } ] } );
		expect( pills() ).toHaveLength( 3 );
	} );

	it( 'takes numeric string ids, and sends the post id as a number', async () => {
		host.callServerTool.mockResolvedValue( { content: [] } );
		await showCard( {
			structuredContent: { ...RESULT, site: { id: '7' }, post: { id: '42', title: 'Old' } },
		} );

		pills()[ 0 ].click();
		expect( host.callServerTool ).toHaveBeenCalledWith( {
			name: 'wpcom-post-editor-set-title',
			arguments: { wpcom_site: '7', post_id: 42, title: 'First', suggestions_id: 's1' },
		} );
	} );

	it( 'sets the clicked title, then marks it and disables the pills', async () => {
		host.callServerTool.mockResolvedValue( { content: [], structuredContent: { version: 6 } } );
		await showCard();

		pills()[ 2 ].click();
		expect( host.callServerTool ).toHaveBeenCalledWith( {
			name: 'wpcom-post-editor-set-title',
			arguments: { wpcom_site: '7', post_id: 42, title: 'Third', suggestions_id: 's1' },
		} );
		await vi.waitFor( () => expect( message()?.textContent ).toBe( 'Title set in the editor' ) );
		expect( pills().every( ( pill ) => pill.disabled ) ).toBe( true );
		expect( pills()[ 2 ].classList.contains( 'is-chosen' ) ).toBe( true );
	} );

	it( 'shows the tool’s error and keeps the pills usable', async () => {
		host.callServerTool.mockResolvedValue( {
			isError: true,
			content: [ { type: 'text', text: 'No session.' } ],
		} );
		await showCard();

		pills()[ 0 ].click();
		await vi.waitFor( () =>
			expect( message()?.textContent ).toBe( 'Couldn’t set the title: No session.' )
		);
		expect( message()?.classList.contains( 'is-error' ) ).toBe( true );
		expect( pills().some( ( pill ) => pill.disabled ) ).toBe( false );
	} );

	it( 'says it can’t set the title when the host can’t call tools', async () => {
		host.callServerTool.mockRejectedValue( new Error( 'IPC not available for MCP tool call' ) );
		await showCard();

		pills()[ 0 ].click();
		await vi.waitFor( () =>
			expect( message()?.textContent ).toBe(
				'Can’t set the title from here. Ask in the chat instead.'
			)
		);
		expect( pills().some( ( pill ) => pill.disabled ) ).toBe( false );
	} );

	it( 'hides when closed', async () => {
		await showCard();
		document.querySelector< HTMLButtonElement >( '.mcp-post-editor-titles__close' )?.click();
		expect( document.getElementById( 'mcp-post-editor-titles' )?.childElementCount ).toBe( 0 );
	} );
} );
