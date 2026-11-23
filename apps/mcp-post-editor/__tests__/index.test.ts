/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { isSummaryOnly } from '../editor/proofread';

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
				issues: { id: string }[];
				feedback: { summary: string; items: { id: string }[] } | null;
				fixStatus: Record< string, Record< string, string > >;
				onFixDone: ( kind: string, ids: string[], status: string, failed: number ) => void;
				onFixUndo: ( kind: string, id: string, reverted: boolean ) => void;
				isCovered: boolean;
				styles: { css: string }[];
				notices: string[];
				onConflict: ( choice: string ) => void;
				onPrompt: ( prompt: string ) => void;
				canMessage: boolean;
				readOnly: boolean;
				changes: { change_id: string }[];
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
	// Runs once while the next update is in flight, as the user's own action.
	duringNextUpdate: undefined as undefined | ( () => void ),
	failNextDiscard: false,
	failNextState: false,
	// The host can't call tools: every call throws its error.
	noToolCalls: false,
	// What the next saves return, in order, and every tool called.
	saveResults: [] as Args[],
	saves: [] as Args[],
	calls: [] as string[],
	// Settles when the site's styles have loaded.
	stylesApplied: Promise.resolve() as Promise< void >,
	// What the config tool returns, unless it throws.
	config: {} as Args | Error,
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
			if ( host.noToolCalls ) {
				throw new Error( 'IPC not available for MCP tool call' );
			}
			if ( name !== 'wpcom-post-editor-config' ) {
				host.calls.push( name );
			}
			if ( name === 'wpcom-post-editor-save' ) {
				host.saves.push( args );
				data = host.saveResults.shift() ?? { saved: true };
			} else if ( name === 'wpcom-post-editor-update' ) {
				host.updates.push( args );
				const during = host.duringNextUpdate;
				host.duringNextUpdate = undefined;
				during?.();
				if ( args.base_version !== server.version ) {
					data = { version: server.version, conflict: true };
				} else {
					server.content = args.content as string;
					server.version++;
					// The server drops the feedback items the update finished, and the summary with
					// the last one.
					const feedback = server.feedback as
						{ summary: string; items: { id: string }[] } | undefined;
					const done = ( args.feedback_done_ids ?? [] ) as string[];
					if ( feedback && done.length ) {
						const items = feedback.items.filter( ( item ) => ! done.includes( item.id ) );
						server.feedback = { summary: items.length ? feedback.summary : '', items };
					}
					// And the proofreading issues.
					const pdone = ( args.proofread_done_ids ?? [] ) as string[];
					if ( server.proofread && pdone.length ) {
						server.proofread = ( server.proofread as { id: string }[] ).filter(
							( issue ) => ! pdone.includes( issue.id )
						);
					}
					data = { version: server.version };
					if ( host.loseNextReply ) {
						host.loseNextReply = false;
						throw new Error( 'timed out' );
					}
				}
			} else if ( name === 'wpcom-post-editor-discard' && host.failNextDiscard ) {
				host.failNextDiscard = false;
				throw new Error( 'discard failed' );
			} else if ( name === 'wpcom-post-editor-config' ) {
				if ( host.config instanceof Error ) {
					throw host.config;
				}
				data = host.config;
			} else if ( name === 'wpcom-post-editor-state' && host.failNextState ) {
				host.failNextState = false;
				throw new Error( 'state failed' );
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
// Each render's props, at once: React would render them later. The page renders the editor and
// the loader over it, each when shown; `rendered` names those shown.
type Rendered = { type: { name: string }; props: typeof host.editor };
vi.mock( '@wordpress/element', async ( importOriginal ) => ( {
	...( await importOriginal< object >() ),
	createRoot: () => ( {
		render: ( element: { props: { children: ( Rendered | null )[] } } ) => {
			const shown = element.props.children.filter( ( child ): child is Rendered => !! child );
			host.rendered = shown.map( ( child ) => child.type.name ).join( '+' );
			const editor = shown.find( ( child ) => child.type.name !== 'Loader' );
			if ( editor ) {
				host.editor = editor.props;
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
vi.mock( '../site-styles', () => ( { applySiteStyles: () => host.stylesApplied } ) );
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
		host.duringNextUpdate = undefined;
		host.failNextDiscard = false;
		host.failNextState = false;
		host.noToolCalls = false;
		host.saveResults = [];
		host.saves = [];
		host.calls = [];
		host.rendered = '';
		host.messages = [];
		host.stylesApplied = Promise.resolve();
		host.config = {};
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

	it( 'keeps the loader over the editor until the site’s styles have loaded', async () => {
		let stylesLoaded = () => {};
		host.stylesApplied = new Promise( ( resolve ) => ( stylesLoaded = resolve ) );
		host.config = { styles: [ { css: 'h1 { font-family: serif; }' } ] };
		await openPost( paragraph( 'Hi.' ) );

		expect( host.rendered ).toBe( 'PostEditor+Loader' );
		expect( host.editor?.styles ).toEqual( [ { css: 'h1 { font-family: serif; }' } ] );
		expect( host.editor?.isCovered ).toBe( true );

		stylesLoaded();
		await vi.advanceTimersByTimeAsync( 0 );
		expect( host.rendered ).toBe( 'PostEditor' );
		expect( host.editor?.isCovered ).toBe( false );
	} );

	it( 'shows the post without the site’s styles after 4 seconds', async () => {
		host.stylesApplied = new Promise( () => {} );
		await openPost( paragraph( 'Hi.' ) );
		await vi.advanceTimersByTimeAsync( 3900 );
		expect( host.rendered ).toBe( 'PostEditor+Loader' );

		await vi.advanceTimersByTimeAsync( 100 );
		expect( host.rendered ).toBe( 'PostEditor' );
	} );

	it( 'shows the post with the error when the site’s styles fail', async () => {
		host.config = new Error( 'down' );
		await openPost( paragraph( 'Hi.' ) );
		// Three attempts, a second apart and then two.
		await vi.advanceTimersByTimeAsync( 3000 );

		expect( host.rendered ).toBe( 'PostEditor' );
		expect( host.editor?.notices ).toEqual( [ 'Couldn’t load the site’s styles: down' ] );
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
		host.editor?.onFixDone( 'proofread', [ 'p1' ], 'applied', 0 );
		await vi.advanceTimersByTimeAsync( 1000 );

		expect( host.updates ).toHaveLength( 1 );
		expect( lastUpdate() ).toMatchObject( {
			content: paragraph( 'a typo' ),
			proofread_done_ids: [ 'p1' ],
		} );
	} );

	const feedbackItem = ( id: string, block_index: number | null = 1 ) => ( {
		id,
		block_index,
		title: id,
		feedback: '',
		requires_manual: true,
	} );

	it( 'shows the feedback from state in the server’s order', async () => {
		await openPost( paragraph( 'a' ), {
			feedback: {
				summary: 'Good',
				items: [ feedbackItem( 'f3', 3 ), feedbackItem( 'f1', 1 ), feedbackItem( 'fw', null ) ],
			},
		} );
		expect( host.editor?.feedback?.summary ).toBe( 'Good' );
		expect( host.editor?.feedback?.items.map( ( { id } ) => id ) ).toEqual( [ 'f3', 'f1', 'fw' ] );
	} );

	it( 'sends a finished feedback item with the typing, and keeps its card for Undo', async () => {
		await openPost( paragraph( 'a' ), {
			feedback: { summary: 'Good', items: [ feedbackItem( 'f1' ), feedbackItem( 'f2' ) ] },
		} );
		host.editor?.onChange( { title: 'Title', content: paragraph( 'b' ) } );
		host.editor?.onFixDone( 'feedback', [ 'f1' ], 'applied', 0 );
		host.editor?.onFixDone( 'feedback', [ 'f2' ], 'dismissed', 0 );
		expect( host.editor?.fixStatus.feedback ).toEqual( { f1: 'applied', f2: 'dismissed' } );
		await vi.advanceTimersByTimeAsync( 1000 );

		expect( host.updates ).toHaveLength( 1 );
		expect( lastUpdate() ).toMatchObject( {
			content: paragraph( 'b' ),
			feedback_done_ids: [ 'f1', 'f2' ],
		} );
		expect( lastUpdate() ).not.toHaveProperty( 'proofread_done_ids' );
		// The state after the update has neither item, nor the summary: their cards stay, with Undo.
		expect( host.calls.at( -1 ) ).toBe( 'wpcom-post-editor-state' );
		expect( host.server.feedback ).toEqual( { summary: '', items: [] } );
		expect( host.editor?.feedback?.items.map( ( { id } ) => id ) ).toEqual( [ 'f1', 'f2' ] );
		expect( host.editor?.fixStatus.feedback ).toEqual( { f1: 'applied', f2: 'dismissed' } );

		// Undo opens a sent item again here, and it stays open.
		host.editor?.onFixUndo( 'feedback', 'f2', true );
		host.editor?.onChange( { title: 'Title', content: paragraph( 'c' ) } );
		await vi.advanceTimersByTimeAsync( 1000 );
		expect( host.editor?.feedback?.items.map( ( { id } ) => id ) ).toEqual( [ 'f1', 'f2' ] );
		expect( host.editor?.fixStatus.feedback ).toEqual( { f1: 'applied' } );
	} );

	it( 'shows no review when the post opens with its review finished', async () => {
		await openPost( paragraph( 'a' ), { feedback: { summary: '', items: [] } } );

		expect( host.editor?.feedback ).toEqual( { summary: '', items: [] } );
		const feedback = host.editor?.feedback as Parameters< typeof isSummaryOnly >[ 0 ];
		expect( isSummaryOnly( feedback ) ).toBe( false );
	} );

	it( 'replaces the feedback and its statuses with a new review', async () => {
		await openPost( paragraph( 'a' ), {
			feedback: { summary: 'Good', items: [ feedbackItem( 'f1' ) ] },
		} );
		host.editor?.onFixDone( 'feedback', [ 'f1' ], 'dismissed', 0 );
		host.server.feedback = { summary: 'Better', items: [ feedbackItem( 'g1' ) ] };
		host.server.version++;
		await type( paragraph( 'b' ) );

		expect( host.editor?.feedback ).toMatchObject( { summary: 'Better', items: [ { id: 'g1' } ] } );
		expect( host.editor?.fixStatus.feedback ).toEqual( {} );
	} );

	it( 'shows an item again on Undo, and doesn’t send it when it hasn’t gone yet', async () => {
		await openPost( paragraph( 'a' ) );
		host.editor?.onFixDone( 'feedback', [ 'f1', 'f2' ], 'dismissed', 0 );
		host.editor?.onFixUndo( 'feedback', 'f1', true );
		expect( host.editor?.fixStatus.feedback ).toEqual( { f2: 'dismissed' } );
		await vi.advanceTimersByTimeAsync( 1000 );
		expect( lastUpdate().feedback_done_ids ).toEqual( [ 'f2' ] );

		// Already sent: Undo shows it again here only.
		host.editor?.onFixUndo( 'feedback', 'f2', true );
		expect( host.editor?.fixStatus.feedback ).toEqual( {} );
	} );

	it( 'doesn’t send again an item undone while its update was refused', async () => {
		await openPost( paragraph( 'a' ) );
		// The update goes on a stale version, and is refused.
		host.server.version++;
		host.editor?.onFixDone( 'feedback', [ 'f1', 'f2' ], 'dismissed', 0 );
		host.duringNextUpdate = () => host.editor?.onFixUndo( 'feedback', 'f1', true );
		await vi.advanceTimersByTimeAsync( 1000 );

		expect( host.updates.map( ( update ) => update.feedback_done_ids ) ).toEqual( [
			[ 'f1', 'f2' ],
			[ 'f2' ],
		] );
	} );

	it( 'keeps an applied item applied when its text changed since', async () => {
		await openPost( paragraph( 'a' ) );
		host.editor?.onFixDone( 'feedback', [ 'f1' ], 'applied', 0 );
		host.editor?.onFixUndo( 'feedback', 'f1', false );

		expect( host.editor?.fixStatus.feedback ).toEqual( { f1: 'applied' } );
		expect( host.editor?.status ).toBe(
			'Couldn’t undo the change: its text changed since. Edit it by hand.'
		);
	} );

	const issue = ( id: string ) => ( {
		id,
		block_index: 1,
		quote: 'tpyo',
		replacement: 'typo',
		reason: '',
		kind: 'spelling',
	} );

	it( 'keeps finished proofreading issues, with Undo, when the server drops them', async () => {
		await openPost( paragraph( 'a tpyo' ), { proofread: [ issue( 'p1' ), issue( 'p2' ) ] } );
		host.editor?.onChange( { title: 'Title', content: paragraph( 'a typo' ) } );
		host.editor?.onFixDone( 'proofread', [ 'p1' ], 'applied', 0 );
		host.editor?.onFixDone( 'proofread', [ 'p2' ], 'dismissed', 0 );
		await vi.advanceTimersByTimeAsync( 1000 );

		expect( lastUpdate() ).toMatchObject( { proofread_done_ids: [ 'p1', 'p2' ] } );
		expect( lastUpdate() ).not.toHaveProperty( 'feedback_done_ids' );
		// The state after the update has neither issue: their cards stay, with Undo.
		expect( host.calls.at( -1 ) ).toBe( 'wpcom-post-editor-state' );
		expect( host.server.proofread ).toEqual( [] );
		expect( host.editor?.issues.map( ( { id } ) => id ) ).toEqual( [ 'p1', 'p2' ] );
		expect( host.editor?.fixStatus.proofread ).toEqual( { p1: 'applied', p2: 'dismissed' } );

		// Undo opens a sent issue again here, and it stays open.
		host.editor?.onFixUndo( 'proofread', 'p1', true );
		await type( paragraph( 'a tpyo' ) );
		expect( host.editor?.issues.map( ( { id } ) => id ) ).toEqual( [ 'p1', 'p2' ] );
		expect( host.editor?.fixStatus.proofread ).toEqual( { p2: 'dismissed' } );
		expect( lastUpdate() ).not.toHaveProperty( 'proofread_done_ids' );
	} );

	it( 'doesn’t send a proofreading issue undone before its update went', async () => {
		await openPost( paragraph( 'a' ), { proofread: [ issue( 'p1' ), issue( 'p2' ) ] } );
		host.editor?.onFixDone( 'proofread', [ 'p1', 'p2' ], 'dismissed', 0 );
		host.editor?.onFixUndo( 'proofread', 'p1', true );
		expect( host.editor?.fixStatus.proofread ).toEqual( { p2: 'dismissed' } );
		await vi.advanceTimersByTimeAsync( 1000 );

		expect( lastUpdate().proofread_done_ids ).toEqual( [ 'p2' ] );
		expect( host.server.proofread ).toEqual( [ issue( 'p1' ) ] );
		expect( host.editor?.issues.map( ( { id } ) => id ) ).toEqual( [ 'p1', 'p2' ] );
	} );

	it( 'doesn’t send again a proofreading issue undone while its update was refused', async () => {
		await openPost( paragraph( 'a' ), { proofread: [ issue( 'p1' ), issue( 'p2' ) ] } );
		host.server.version++;
		host.editor?.onFixDone( 'proofread', [ 'p1', 'p2' ], 'applied', 0 );
		host.duringNextUpdate = () => host.editor?.onFixUndo( 'proofread', 'p1', true );
		await vi.advanceTimersByTimeAsync( 1000 );

		expect( host.updates.map( ( update ) => update.proofread_done_ids ) ).toEqual( [
			[ 'p1', 'p2' ],
			[ 'p2' ],
		] );
	} );

	it( 'replaces the proofreading issues and their statuses with a new run', async () => {
		await openPost( paragraph( 'a' ), { proofread: [ issue( 'p1' ), issue( 'p2' ) ] } );
		host.editor?.onFixDone( 'proofread', [ 'p1' ], 'dismissed', 0 );
		host.editor?.onFixDone( 'feedback', [ 'f1' ], 'dismissed', 0 );
		await vi.advanceTimersByTimeAsync( 1000 );
		expect( host.editor?.issues.map( ( { id } ) => id ) ).toEqual( [ 'p1', 'p2' ] );

		host.server.proofread = [ issue( 'q1' ) ];
		host.server.version++;
		await type( paragraph( 'b' ) );

		expect( host.editor?.issues.map( ( { id } ) => id ) ).toEqual( [ 'q1' ] );
		expect( host.editor?.fixStatus ).toEqual( { proofread: {}, feedback: { f1: 'dismissed' } } );
	} );

	it( 'clears open proofreading issues with an empty new run', async () => {
		await openPost( paragraph( 'a' ), { proofread: [ issue( 'p1' ), issue( 'p2' ) ] } );
		host.editor?.onFixDone( 'proofread', [ 'p1' ], 'dismissed', 0 );
		await type( paragraph( 'b' ) );
		expect( host.editor?.issues.map( ( { id } ) => id ) ).toEqual( [ 'p1', 'p2' ] );

		// A clean run: p2, still open and never sent as done, is gone.
		host.server.proofread = [];
		host.server.version++;
		await type( paragraph( 'c' ) );

		expect( host.editor?.issues ).toEqual( [] );
		expect( host.editor?.fixStatus.proofread ).toEqual( {} );
	} );

	it( 'keeps a proofreading issue undone after it was sent when the server lists it no more', async () => {
		await openPost( paragraph( 'a' ), { proofread: [ issue( 'p1' ), issue( 'p2' ) ] } );
		host.editor?.onFixDone( 'proofread', [ 'p1', 'p2' ], 'dismissed', 0 );
		await type( paragraph( 'b' ) );
		expect( host.server.proofread ).toEqual( [] );

		host.editor?.onFixUndo( 'proofread', 'p1', true );
		host.server.version++;
		await type( paragraph( 'c' ) );

		expect( host.editor?.issues.map( ( { id } ) => id ) ).toEqual( [ 'p1', 'p2' ] );
		expect( host.editor?.fixStatus.proofread ).toEqual( { p2: 'dismissed' } );
	} );

	it( 'clears open feedback items with an empty new review', async () => {
		await openPost( paragraph( 'a' ), {
			feedback: { summary: 'Good', items: [ feedbackItem( 'f1' ), feedbackItem( 'f2' ) ] },
		} );
		host.editor?.onFixDone( 'feedback', [ 'f1' ], 'dismissed', 0 );
		await type( paragraph( 'b' ) );
		expect( host.editor?.feedback?.items.map( ( { id } ) => id ) ).toEqual( [ 'f1', 'f2' ] );

		// A review with nothing to change: f2, still open and never sent as done, is gone.
		host.server.feedback = { summary: '', items: [] };
		host.server.version++;
		await type( paragraph( 'c' ) );

		expect( host.editor?.feedback ).toEqual( { summary: '', items: [] } );
		expect( host.editor?.fixStatus.feedback ).toEqual( {} );
	} );

	it( 'keeps a feedback item undone after it was sent when the server lists it no more', async () => {
		await openPost( paragraph( 'a' ), {
			feedback: { summary: 'Good', items: [ feedbackItem( 'f1' ), feedbackItem( 'f2' ) ] },
		} );
		host.editor?.onFixDone( 'feedback', [ 'f1', 'f2' ], 'dismissed', 0 );
		await type( paragraph( 'b' ) );
		expect( host.server.feedback ).toEqual( { summary: '', items: [] } );

		host.editor?.onFixUndo( 'feedback', 'f1', true );
		host.server.version++;
		await type( paragraph( 'c' ) );

		expect( host.editor?.feedback?.items.map( ( { id } ) => id ) ).toEqual( [ 'f1', 'f2' ] );
		expect( host.editor?.fixStatus.feedback ).toEqual( { f2: 'dismissed' } );
	} );

	it( 'asks again for the pending changes when the first ask fails', async () => {
		// Earlier tests' pages listen on the same document: only this page's listener runs.
		const addListener = vi.spyOn( document, 'addEventListener' );
		host.failNextState = true;
		await openPost( paragraph( 'a' ), {
			changes: [
				{ change_id: 'c1', block_index: 1, before: paragraph( 'a' ), after: paragraph( 'A' ) },
			],
		} );
		expect( host.editor?.changes ).toEqual( [] );

		// Hidden, the page doesn't poll, so it doesn't ask again.
		await vi.advanceTimersByTimeAsync( 10000 );
		expect( host.calls ).toEqual( [ 'wpcom-post-editor-state' ] );

		Object.defineProperty( document, 'hidden', { value: false, configurable: true } );
		const onVisibilityChange = addListener.mock.calls.find(
			( [ type ] ) => type === 'visibilitychange'
		)?.[ 1 ] as () => void;
		onVisibilityChange();
		await vi.advanceTimersByTimeAsync( 2000 );
		expect( host.calls ).toEqual( [
			'wpcom-post-editor-state',
			'wpcom-post-editor-state',
			'wpcom-post-editor-state',
		] );
		expect( host.editor?.changes ).toMatchObject( [ { change_id: 'c1' } ] );
		addListener.mockRestore();
	} );

	it( 'polls a newly opened post soon after failed polls slowed down the last one', async () => {
		Object.defineProperty( document, 'hidden', { value: false, configurable: true } );
		await openPost( paragraph( 'a' ) );
		host.failNextState = true;
		await vi.advanceTimersByTimeAsync( 2000 );
		host.failNextState = true;
		await vi.advanceTimersByTimeAsync( 4000 );
		// The next poll waits 8 seconds.
		expect( host.calls ).toHaveLength( 3 );

		host.listeners.toolresult( {
			structuredContent: {
				site: { id: 1, url: 'https://example.com' },
				post: { id: 3, title: 'Other' },
				content: paragraph( 'b' ),
				version: 1,
			},
		} );
		await vi.advanceTimersByTimeAsync( 0 );
		expect( host.calls ).toHaveLength( 4 );
		await vi.advanceTimersByTimeAsync( 2000 );
		expect( host.calls ).toHaveLength( 5 );
	} );

	it( 'shows the user’s latest typing, sanitized, when the page turns read-only', async () => {
		await openPost( paragraph( 'a' ) );
		host.noToolCalls = true;
		await type( paragraph( 'b<script>alert(1)</script>' ) );

		expect( host.editor?.readOnly ).toBe( true );
		expect( host.editor?.post?.content ).toBe( paragraph( 'b' ) );
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
