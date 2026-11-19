/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

type Args = Record< string, unknown >;
type Listener = ( result: unknown ) => void;

// The page's host and the server's post, in place of the MCP host.
const host = vi.hoisted( () => ( {
	listeners: {} as Record< string, Listener >,
	editor: undefined as
		| undefined
		| {
				post?: { title: string; content: string };
				onChange: ( post: { title: string; content: string } ) => void;
				onDecide: ( decision: string, ids: string[] ) => void;
		  },
	server: { version: 1, title: 'Title', content: '' },
	updates: [] as Args[],
	// The next update is taken, but its reply is lost.
	loseNextReply: false,
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
		async callServerTool( { name, arguments: args }: { name: string; arguments: Args } ) {
			const { server } = host;
			let data: Args;
			if ( name === 'wpcom-post-editor-update' ) {
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

async function openPost( content: string ) {
	host.server = { version: 1, title: 'Title', content };
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
	} );

	afterEach( () => {
		vi.useRealTimers();
		vi.unstubAllGlobals();
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
} );
