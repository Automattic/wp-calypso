/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

type Args = Record< string, unknown >;
type Listener = ( result: unknown ) => void;

// The page's host and the server's post, in place of the MCP host.
const host = vi.hoisted( () => ( {
	listeners: {} as Record< string, Listener >,
	// The component the page last rendered.
	rendered: '',
	messages: [] as unknown[],
	editor: undefined as
		| undefined
		| {
				post?: { title: string; content: string };
				onChange: ( post: { title: string; content: string } ) => void;
				onDecide: ( decision: string, ids: string[] ) => void;
				onSave: () => void;
				onProofreadDone: ( ids: string[], failed: number ) => void;
				titleSuggestions?: { id: string; titles: string[] };
				onTitleSuggestionsDone: ( id: string ) => void;
				onConflict: ( choice: string ) => void;
				onPrompt: ( prompt: string ) => void;
				canMessage: boolean;
				readOnly: boolean;
				status: string;
				conflict?: string;
		  },
	server: { version: 1, title: 'Title', content: '' } as Args & {
		version: number;
		title: string;
		content: string;
	},
	updates: [] as Args[],
	// The next update is taken, but its reply is lost.
	loseNextReply: false,
	failNextDiscard: false,
	// What the next saves return, in order, and every tool called.
	saveResults: [] as Args[],
	saves: [] as Args[],
	calls: [] as string[],
} ) );

vi.mock( '@modelcontextprotocol/ext-apps/app-with-deps', () => ( {
	App: class {
		addEventListener( name: string, listener: Listener ) {
			host.listeners[ name ] = listener;
		}
		connect() {
			return Promise.resolve();
		}
		getHostContext() {
			return {};
		}
		getHostCapabilities() {
			return {};
		}
		async sendMessage( params: unknown ) {
			host.messages.push( params );
			return {};
		}
		async callServerTool( { name, arguments: args }: { name: string; arguments: Args } ) {
			const { server } = host;
			let data: Args;
			if ( name !== 'wpcom-post-editor-config' ) {
				host.calls.push( name );
			}
			if ( name === 'wpcom-post-editor-save' ) {
				host.saves.push( args );
				data = host.saveResults.shift() ?? { saved: true };
			} else if ( name === 'wpcom-post-editor-update' ) {
				host.updates.push( args );
				if ( args.base_version !== server.version ) {
					data = { version: server.version, conflict: true };
				} else {
					server.content = args.content as string;
					server.version++;
					data = { version: server.version };
					if ( host.loseNextReply ) {
						host.loseNextReply = false;
						throw new Error( 'timed out' );
					}
				}
			} else if ( name === 'wpcom-post-editor-discard' && host.failNextDiscard ) {
				host.failNextDiscard = false;
				throw new Error( 'discard failed' );
			} else if ( name === 'wpcom-post-editor-state' ) {
				data =
					server.version > ( args.since_version as number )
						? { changed: true, ...server }
						: { version: server.version, changed: false };
			} else {
				data = {};
			}
			return { structuredContent: data, content: [] };
		}
	},
} ) );
// Each render's props, at once: React would render them later.
vi.mock( '@wordpress/element', async ( importOriginal ) => ( {
	...( await importOriginal< object >() ),
	createRoot: () => ( {
		render: ( element: { type: { name: string }; props: typeof host.editor } ) => {
			host.rendered = element.type.name;
			if ( host.rendered !== 'Loader' ) {
				host.editor = element.props;
			}
		},
	} ),
	flushSync: ( callback: () => void ) => callback(),
} ) );
vi.mock( '../editor', () => ( {
	PostEditor: ( props: NonNullable< typeof host.editor > ) => {
		host.editor = props;
		return null;
	},
} ) );
// The block library loads only through the bundler. Blocks here are already as the editor
// serializes them, so splitting on blank lines gives the same blocks.
vi.mock( '../editor/blocks', () => ( {
	splitBlocks: ( content: string ) => ( content ? content.split( '\n\n' ) : [] ),
	joinBlocks: ( blocks: string[] ) => blocks.join( '\n\n' ),
} ) );
vi.mock( '../site-styles', () => ( { applySiteStyles: () => {} } ) );
vi.mock( '../style.scss', () => ( {} ) );

const paragraph = ( text: string ) =>
	`<!-- wp:paragraph -->\n<p>${ text }</p>\n<!-- /wp:paragraph -->`;
const lastUpdate = () => host.updates[ host.updates.length - 1 ];

async function openPost( content: string, state: Args = {} ) {
	host.server = { version: 1, title: 'Title', content, ...state };
	await import( '../index' );
	host.listeners.toolresult( {
		structuredContent: {
			site: { id: 1, url: 'https://example.com' },
			post: { id: 2, title: 'Title' },
			content,
			version: 1,
		},
	} );
	await vi.advanceTimersByTimeAsync( 0 );
}

async function type( content: string ) {
	host.editor?.onChange( { title: 'Title', content } );
	await vi.advanceTimersByTimeAsync( 1000 );
}

describe( 'the page', () => {
	beforeEach( () => {
		vi.resetModules();
		vi.useFakeTimers();
		vi.stubGlobal( 'BroadcastChannel', undefined );
		// No polls: each test drives the state calls through its saves.
		Object.defineProperty( document, 'hidden', { value: true, configurable: true } );
		host.updates = [];
		host.loseNextReply = false;
		host.failNextDiscard = false;
		host.saveResults = [];
		host.saves = [];
		host.calls = [];
		host.rendered = '';
		host.messages = [];
	} );

	afterEach( () => {
		vi.useRealTimers();
		vi.unstubAllGlobals();
	} );

	it( 'shows the loader until the first post is in the editor', async () => {
		await import( '../index' );
		await vi.advanceTimersByTimeAsync( 0 );
		expect( host.rendered ).toBe( 'Loader' );

		await openPost( paragraph( 'Hi.' ) );
		expect( host.rendered ).toBe( 'PostEditor' );
	} );

	it( 'replaces the loader with the error when the tool result fails', async () => {
		await import( '../index' );
		host.listeners.toolresult( { isError: true, content: [ { type: 'text', text: 'No post.' } ] } );
		await vi.advanceTimersByTimeAsync( 0 );
		expect( host.rendered ).toBe( 'PostEditor' );
		expect( host.editor?.status ).toBe( 'Couldn’t open the post: No post.' );
	} );

	it( 'sends a chip’s prompt through ChatGPT’s follow-up call when it has one', async () => {
		const prompts: unknown[] = [];
		vi.stubGlobal( 'openai', {
			sendFollowUpMessage: async ( args: unknown ) => void prompts.push( args ),
		} );
		await openPost( paragraph( 'Hi.' ) );
		host.editor?.onPrompt( 'proofread' );
		await vi.advanceTimersByTimeAsync( 0 );
		expect( prompts ).toEqual( [ { prompt: expect.stringContaining( 'Proofread my post' ) } ] );
		expect( host.messages ).toEqual( [] );
		expect( host.editor?.status ).toBe( 'Asked: Proofread' );
	} );

	it( 'enables the chips with ChatGPT’s follow-up call when the host has no message capability', async () => {
		await openPost( paragraph( 'Hi.' ) );
		expect( host.editor?.canMessage ).toBe( false );

		vi.resetModules();
		vi.stubGlobal( 'openai', { sendFollowUpMessage: async () => {} } );
		await openPost( paragraph( 'Hi.' ) );
		expect( host.editor?.canMessage ).toBe( true );
	} );

	it( 'sends a chip’s prompt as a user message elsewhere', async () => {
		await openPost( paragraph( 'Hi.' ) );
		host.editor?.onPrompt( 'proofread' );
		await vi.advanceTimersByTimeAsync( 0 );
		expect( host.messages ).toEqual( [
			{
				role: 'user',
				content: [ { type: 'text', text: expect.stringContaining( 'Proofread my post' ) } ],
			},
		] );
	} );

	it( 'keeps the markup the user didn’t edit byte for byte', async () => {
		const content = [
			'<!-- wp:heading {"anchor":"images"} -->\n<h2 id="images" class="wp-block-heading">Images</h2>\n<!-- /wp:heading -->',
			paragraph(
				'Read <a href="https://wordpress.com/" target="_blank" rel="noreferrer noopener">the guide</a>.'
			),
			'<!-- wp:html -->\n<iframe src="https://www.youtube.com/embed/x"></iframe>\n<!-- /wp:html -->',
			paragraph( 'A tpyo.' ),
		].join( '\n\n' );
		await openPost( content );
		expect( host.editor?.post?.content ).toBe( content );

		await type( content.replace( 'tpyo', 'typo' ) );
		expect( lastUpdate().content ).toBe( content.replace( 'tpyo', 'typo' ) );
	} );

	it( 'sends a decision with the typing, and again after a conflict', async () => {
		await openPost( paragraph( 'a' ) );
		host.server.version++;
		host.editor?.onChange( { title: 'Title', content: paragraph( 'b' ) } );
		host.editor?.onDecide( 'reject', [ 'c1' ] );
		await vi.advanceTimersByTimeAsync( 0 );

		expect( host.updates ).toHaveLength( 2 );
		expect( host.updates[ 0 ] ).toMatchObject( { reject_change_ids: [ 'c1' ] } );
		expect( lastUpdate() ).toMatchObject( {
			content: paragraph( 'b' ),
			reject_change_ids: [ 'c1' ],
		} );
		expect( host.server.content ).toBe( paragraph( 'b' ) );
	} );

	it( 'sends an Undo that travels with its own Accept as a reject', async () => {
		await openPost( paragraph( 'a' ) );
		// The first decision's update is in flight, so the next ones wait for one update.
		host.editor?.onDecide( 'reject', [ 'c0' ] );
		host.editor?.onDecide( 'accept', [ 'c1' ] );
		host.editor?.onDecide( 'undo', [ 'c1' ] );
		await vi.advanceTimersByTimeAsync( 0 );

		expect( host.updates ).toHaveLength( 2 );
		expect( lastUpdate().reject_change_ids ).toEqual( [ 'c1' ] );
		expect( lastUpdate() ).not.toHaveProperty( 'accept_change_ids' );
		expect( lastUpdate() ).not.toHaveProperty( 'undo_change_ids' );
	} );

	it( 'replaces its own lost update when a later one conflicts', async () => {
		const blocks = [ paragraph( 'a' ), paragraph( 'b' ), paragraph( 'c' ) ];
		const withB = ( text: string ) =>
			[ blocks[ 0 ], paragraph( text ), blocks[ 2 ] ].join( '\n\n' );
		await openPost( blocks.join( '\n\n' ) );

		host.loseNextReply = true;
		await type( withB( 'B' ) );
		expect( host.server.content ).toBe( withB( 'B' ) );

		// Sent against version 1, which the lost update moved on: a conflict, then a merge.
		await type( withB( 'B2' ) );
		await vi.advanceTimersByTimeAsync( 1000 );
		expect( host.updates.map( ( update ) => update.content ) ).toEqual( [
			withB( 'B' ),
			withB( 'B2' ),
			withB( 'B2' ),
		] );
		expect( host.server.content ).toBe( withB( 'B2' ) );
	} );

	it( 'sends the typing before it saves', async () => {
		await openPost( paragraph( 'a' ) );
		host.editor?.onChange( { title: 'Title', content: paragraph( 'b' ) } );
		host.editor?.onSave();
		await vi.advanceTimersByTimeAsync( 0 );

		expect( host.calls ).toEqual( [
			'wpcom-post-editor-state',
			'wpcom-post-editor-update',
			'wpcom-post-editor-save',
		] );
		expect( host.server.content ).toBe( paragraph( 'b' ) );
		expect( host.editor?.status ).toBe( 'Saved to WordPress.com' );
	} );

	it( 'asks for the agent’s changes to be decided when the save finds some pending', async () => {
		await openPost( paragraph( 'a' ) );
		host.saveResults = [ { saved: false, pending_changes: 2 } ];
		host.editor?.onSave();
		await vi.advanceTimersByTimeAsync( 0 );

		expect( host.editor?.status ).toBe( 'Accept or reject the agent’s changes before saving.' );
	} );

	it( 'takes in the post and saves again once when the save is stale', async () => {
		await openPost( paragraph( 'a' ) );
		host.server.content = paragraph( 'remote' );
		host.server.version++;
		host.saveResults = [ { saved: false, stale: true, version: host.server.version } ];
		host.editor?.onSave();
		await vi.advanceTimersByTimeAsync( 0 );

		expect( host.calls.slice( 1 ) ).toEqual( [
			'wpcom-post-editor-save',
			'wpcom-post-editor-state',
			'wpcom-post-editor-save',
		] );
		expect( host.editor?.post?.content ).toBe( paragraph( 'remote' ) );
		expect( host.editor?.status ).toBe( 'Saved to WordPress.com' );
	} );

	it( 'shows the conflict, and keeps the user’s version with its stamp', async () => {
		await openPost( paragraph( 'a' ) );
		host.saveResults = [ { saved: false, conflict: { remote_modified: '2026-11-19T10:00:00' } } ];
		host.editor?.onSave();
		await vi.advanceTimersByTimeAsync( 0 );
		expect( host.editor?.conflict ).toBe( '2026-11-19T10:00:00' );

		host.saveResults = [ { saved: true } ];
		( host.editor as unknown as { onConflict: ( choice: string ) => void } ).onConflict( 'keep' );
		await vi.advanceTimersByTimeAsync( 0 );
		expect( host.saves.at( -1 ) ).toMatchObject( {
			overwrite: true,
			overwrite_stamp: '2026-11-19T10:00:00',
		} );
		expect( host.editor?.conflict ).toBeUndefined();
		expect( host.editor?.status ).toBe( 'Saved to WordPress.com' );
	} );

	it( 'sends a finished proofreading issue with the typing in the next update', async () => {
		await openPost( paragraph( 'a tpyo' ) );
		host.editor?.onChange( { title: 'Title', content: paragraph( 'a typo' ) } );
		host.editor?.onProofreadDone( [ 'p1' ], 0 );
		await vi.advanceTimersByTimeAsync( 1000 );

		expect( host.updates ).toHaveLength( 1 );
		expect( lastUpdate() ).toMatchObject( {
			content: paragraph( 'a typo' ),
			proofread_done_ids: [ 'p1' ],
		} );
	} );

	it( 'sends a picked title with its suggestions’ id in one update, and hides them', async () => {
		const titleSuggestions = { id: 't1', titles: [ 'Better', 'Best' ] };
		await openPost( paragraph( 'text' ), { title_suggestions: titleSuggestions } );
		expect( host.editor?.titleSuggestions ).toEqual( titleSuggestions );

		// The pick types the title in, then reports the set done.
		host.editor?.onChange( { title: 'Best', content: paragraph( 'text' ) } );
		host.editor?.onTitleSuggestionsDone( 't1' );
		expect( host.editor?.titleSuggestions ).toBeUndefined();
		await vi.advanceTimersByTimeAsync( 1000 );

		expect( host.updates ).toHaveLength( 1 );
		expect( lastUpdate() ).toMatchObject( { title: 'Best', title_suggestions_done_id: 't1' } );
		expect( lastUpdate() ).not.toHaveProperty( 'content' );
	} );

	it( 'shows the user’s post, editable, when Reload fails during an update', async () => {
		await openPost( paragraph( 'a' ) );
		host.failNextDiscard = true;
		host.editor?.onChange( { title: 'Title', content: paragraph( 'b' ) } );
		host.editor?.onDecide( 'accept', [ 'c1' ] );
		host.editor?.onConflict( 'reload' );
		expect( host.editor?.readOnly ).toBe( true );
		await vi.advanceTimersByTimeAsync( 0 );

		expect( host.updates ).toHaveLength( 1 );
		expect( lastUpdate() ).toMatchObject( {
			content: paragraph( 'b' ),
			accept_change_ids: [ 'c1' ],
		} );
		expect( host.editor?.readOnly ).toBe( false );
		expect( host.editor?.post?.content ).toBe( paragraph( 'b' ) );
		expect( host.editor?.status ).toBe( 'Couldn’t reload the post: discard failed' );
	} );
} );
