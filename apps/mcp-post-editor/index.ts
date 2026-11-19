import { App } from '@modelcontextprotocol/ext-apps/app-with-deps';
import { createElement, createRoot, flushSync } from '@wordpress/element';
import { PostEditor, type EditorPost } from './editor';
import { joinBlocks, splitBlocks } from './editor/blocks';
import { changeLabel, type AgentChange, type Decision } from './editor/changes';
import { mergePost } from './editor/merge';
import sanitize from './editor/sanitize';
import { applySiteStyles } from './site-styles';
import './style.scss';

type ToolResult = Awaited< ReturnType< App[ 'callServerTool' ] > >;
type HostContext = NonNullable< ReturnType< App[ 'getHostContext' ] > >;
type OpenResult = {
	site: { id: number; url: string };
	post: { id: number; title: string };
	content: string;
	version: number;
};
type StateResult = {
	version: number;
	changed: boolean;
	title?: string;
	content?: string;
	changes?: ( AgentChange & { status?: string } )[];
	proofread?: unknown[];
	conflict?: unknown;
};
type UpdateResult = { version: number; conflict?: boolean };
type ConfigResult = {
	styles?: { css: string }[];
	assets_styles?: string;
	font_faces_html?: string;
};
type Post = { title: string; content: string };

const POLL_INTERVAL = 2000;
const SAVE_DELAY = 1000;
const SAVE_RETRIES = 2;
const CONFIG_ATTEMPTS = 3;
const CONFIG_TIMEOUT = 10000;
// The inline panel's height when the host doesn't fix it; the canvas scrolls inside.
const INLINE_HEIGHT = 560;
// How long Undo stays after Accept, unless the assistant changes the post first.
const UNDO_TIME = 30000;
const LINK_PROTOCOLS = [ 'http:', 'https:', 'mailto:' ];

const root =
	document.getElementById( 'mcp-post-editor' ) ??
	document.body.appendChild(
		Object.assign( document.createElement( 'div' ), { id: 'mcp-post-editor' } )
	);
const reactRoot = createRoot( root );

const app = new App(
	{ name: 'wpcom-post-editor', version: '0.0.1' },
	{ availableDisplayModes: [ 'inline', 'fullscreen' ] }
);
const panelId = `${ Date.now() }-${ Math.random().toString( 36 ).slice( 2 ) }`;
let post: { wpcom_site: string; post_id: number } | undefined;
let siteUrl = '';
let version = 0;
let polls = 0;
let error = '';
let statusMessage = '';
let timer: ReturnType< typeof setTimeout > | undefined;
let polling = false;
let stopped = false;
let opens = 0;
// Set when the host can't run tools for the page, which then shows only the opened post.
let noServerTools = false;
let channel: BroadcastChannel | undefined;
// Errors the poll status must not overwrite, shown until their cause is resolved.
const persistentErrors: { open?: string; config?: string; host?: string } = {};
let styles: ConfigResult[ 'styles' ] = [];
let hostContext: HostContext = {};

// The post the server and this page last agreed on, the user's latest, and what the editor shows.
let base: Post = { title: '', content: '' };
let local: Post = base;
let editorPost: EditorPost | undefined;
// The user changed the title since the last update, so the next one sends it.
let titleChanged = false;
let saveTimer: ReturnType< typeof setTimeout > | undefined;
let saving = false;
let saveQueued = false;
let saveStarts = 0;
// The post the last update sent when the page couldn't tell whether the server took it.
let unconfirmed: Post | undefined;
// The update in flight, so a save stopped behind it can still send the typing after it.
let lastUpdate: Promise< UpdateResult > | undefined;
// The read-only view shows a sanitized copy: it never saves, so nothing sends it back.
let preview: { source?: EditorPost; post?: EditorPost } = {};

// The assistant's pending changes, as the last state listed them.
let changes: AgentChange[] = [];
// Changes the page has shown, and those it decided, which stay hidden until the server agrees.
const seenChanges = new Map< string, AgentChange >();
const decided = new Set< string >();
type Decisions = Record< Decision, string[] >;
const noDecisions = (): Decisions => ( { accept: [], reject: [], undo: [] } );
// Decisions the next update sends, with the typing.
let decisions = noDecisions();
let accepted: { ids: string[]; label: string; timer: ReturnType< typeof setTimeout > } | undefined;
const hasDecisions = ( list: Decisions ) => Object.values( list ).some( ( ids ) => ids.length );
const decisionArgs = ( list: Decisions ) => ( {
	...( list.accept.length && { accept_change_ids: list.accept } ),
	...( list.reject.length && { reject_change_ids: list.reject } ),
	...( list.undo.length && { undo_change_ids: list.undo } ),
} );

function previewPost() {
	if ( preview.source !== editorPost ) {
		preview = {
			source: editorPost,
			post: editorPost && { ...editorPost, content: sanitize( editorPost.content ) },
		};
	}
	return preview.post;
}

function render() {
	const { displayMode, availableDisplayModes, containerDimensions } = hostContext;
	const isFullscreen = displayMode === 'fullscreen';
	const fixedHeight =
		containerDimensions && 'height' in containerDimensions ? containerDimensions.height : undefined;
	const maxHeight =
		containerDimensions && 'maxHeight' in containerDimensions
			? containerDimensions.maxHeight
			: undefined;
	let height = '100vh';
	if ( fixedHeight ) {
		height = `${ fixedHeight }px`;
	} else if ( ! isFullscreen ) {
		height = `${ Math.min( maxHeight ?? INLINE_HEIGHT, INLINE_HEIGHT ) }px`;
	}
	const readOnly = noServerTools || stopped;
	reactRoot.render(
		createElement( PostEditor, {
			post: readOnly ? previewPost() : editorPost,
			styles: styles ?? [],
			readOnly,
			status: statusMessage,
			statusTitle: `Polls: ${ polls }, version ${ version }`,
			isError: !! error,
			notices: Object.values( persistentErrors ).filter( ( message ): message is string =>
				Boolean( message )
			),
			isFullscreen,
			canFullscreen: !! availableDisplayModes?.includes( 'fullscreen' ),
			height,
			onChange: onEditorChange,
			onToggleFullscreen: toggleFullscreen,
			changes: readOnly
				? []
				: placeChanges( changes.filter( ( change ) => ! decided.has( change.change_id ) ) ),
			accepted: readOnly ? undefined : accepted,
			onDecide: decide,
		} )
	);
}

// Where each change's block is now: the user may have added or removed blocks above it.
function placeChanges( list: AgentChange[] ) {
	const blocks = list.length ? splitBlocks( local.content ) : [];
	return list.map( ( change ) => {
		const found =
			change.block_index === null ? -1 : blocks.indexOf( splitBlocks( change.after )[ 0 ] );
		return found < 0 || found + 1 === change.block_index
			? change
			: { ...change, block_index: found + 1 };
	} );
}

function showStatus( message = '' ) {
	statusMessage = message;
	render();
}

function showPersistentError( key: keyof typeof persistentErrors, message?: string ) {
	persistentErrors[ key ] = message;
	render();
}

const errorMessage = ( e: unknown ) => ( e instanceof Error ? e.message : String( e ) );

const resultText = ( result: ToolResult ) =>
	result.content?.map( ( item ) => ( item.type === 'text' ? item.text : '' ) ).join( ' ' ) ||
	'The tool failed';

// Some hosts deliver only `content`, whose first text item is the same object as JSON.
function resultData( result: ToolResult ): Record< string, unknown > | undefined {
	if ( result.structuredContent && typeof result.structuredContent === 'object' ) {
		return result.structuredContent as Record< string, unknown >;
	}
	const first = result.content?.[ 0 ];
	if ( first?.type !== 'text' ) {
		return undefined;
	}
	try {
		const data = JSON.parse( first.text );
		return data && typeof data === 'object' ? data : undefined;
	} catch {
		return undefined;
	}
}

// The host's JSON-RPC error when it can't run tools at all ("IPC not available for MCP tool
// call"). Its code, -32603, also covers any failure in the host's handler, and a tool error
// may say "not available", so only this message tells them apart.
const isHostToolError = ( e: unknown ) => /IPC not available/i.test( errorMessage( e ) );

async function callTool< T >(
	name: string,
	args: Record< string, unknown > = {},
	timeout?: number
) {
	let result: ToolResult;
	try {
		result = await app.callServerTool(
			{ name, arguments: { ...post, ...args } },
			timeout ? { timeout } : undefined
		);
	} catch ( e ) {
		if ( isHostToolError( e ) && ! noServerTools ) {
			noServerTools = true;
			clearTimeout( timer );
			timer = undefined;
			clearTimeout( saveTimer );
			persistentErrors.config = undefined;
			showPersistentError(
				'host',
				'This host can’t call tools from the panel, so site styles, live updates and saving are off.'
			);
		}
		throw e;
	}
	if ( result.isError ) {
		throw new Error( resultText( result ) );
	}
	const data = resultData( result );
	if ( ! data ) {
		throw new Error( 'The tool returned no data' );
	}
	return data as T;
}

const normalize = ( content: string ) => joinBlocks( splitBlocks( content ) );
const isDirty = () => titleChanged || local.content !== base.content || hasDecisions( decisions );

// Synchronous, so typing that follows is reported against the post shown here.
function showInEditor( next: Post ) {
	local = next;
	editorPost = {
		...next,
		id: `${ post?.wpcom_site }:${ post?.post_id }`,
		revision: ( editorPost?.revision ?? 0 ) + 1,
	};
	flushSync( render );
}

function onEditorChange( next: Post ) {
	if ( next.title !== local.title ) {
		titleChanged = true;
	}
	local = next;
	scheduleSave();
	// The outlines and labels follow the blocks the user adds or removes.
	if ( changes.length ) {
		render();
	}
}

function scheduleSave() {
	clearTimeout( saveTimer );
	saveTimer = undefined;
	if ( isDirty() && ! noServerTools && ! stopped ) {
		saveTimer = setTimeout( save, SAVE_DELAY );
	}
}

// One update at a time: a save asked for during another runs when that one ends.
async function save() {
	saveTimer = undefined;
	if ( saving ) {
		saveQueued = true;
		return;
	}
	if ( ! isDirty() || noServerTools || stopped || ! post ) {
		return;
	}
	saving = true;
	saveStarts++;
	const current = opens;
	let sendTitle = false;
	// Decisions sent in an update that didn't succeed, to send again.
	let sentDecisions: Decisions | undefined;
	// The server took the update, so a failure after it isn't a failed save.
	let taken = false;
	error = '';
	showStatus( 'Saving…' );
	try {
		// The server refuses an update on a stale version: take in its post, then try again.
		for ( let attempt = 0; ; attempt++ ) {
			const sent = local;
			sendTitle = titleChanged;
			titleChanged = false;
			// A conflict shows only that this update wasn't taken, not an earlier one.
			const prior = unconfirmed;
			unconfirmed = sent;
			sentDecisions = decisions;
			decisions = noDecisions();
			lastUpdate = callTool< UpdateResult >( 'wpcom-post-editor-update', {
				base_version: version,
				// Unchanged content stays out: the editor's serialization of a block can differ from
				// the server's markup, which would make a reject find the block changed.
				...( sent.content !== base.content && { content: sent.content } ),
				...( sendTitle && { title: sent.title } ),
				...decisionArgs( sentDecisions ),
			} );
			const result = await lastUpdate;
			if ( current !== opens || stopped ) {
				return;
			}
			if ( ! result.conflict ) {
				base = { title: sendTitle ? sent.title : base.title, content: sent.content };
				unconfirmed = undefined;
				if ( ! hasDecisions( sentDecisions ) ) {
					version = result.version;
					break;
				}
				// The server applied the decisions after the content, so its post can differ from
				// the one sent: take it in from the version before.
				const undone = [ ...sentDecisions.reject, ...sentDecisions.undo ];
				sentDecisions = undefined;
				sendTitle = false;
				taken = true;
				const state = await callTool< StateResult >( 'wpcom-post-editor-state', {
					since_version: version,
				} );
				if ( current !== opens || stopped ) {
					return;
				}
				receiveState( state );
				reportUnreverted( undone );
				render();
				break;
			}
			restoreDecisions( sentDecisions );
			sentDecisions = undefined;
			unconfirmed = prior;
			titleChanged ||= sendTitle;
			sendTitle = false;
			if ( attempt >= SAVE_RETRIES ) {
				throw new Error( 'the post keeps changing on the server.' );
			}
			const state = await callTool< StateResult >( 'wpcom-post-editor-state', {
				since_version: version,
			} );
			if ( current !== opens || stopped ) {
				return;
			}
			receiveState( state );
			render();
			clearTimeout( saveTimer );
			saveTimer = undefined;
			if ( ! isDirty() ) {
				break;
			}
		}
		// Keeps a message about the assistant's changes that came in with the save.
		if ( statusMessage === 'Saving…' ) {
			showStatus( 'Saved' );
		}
	} catch ( e ) {
		if ( current !== opens ) {
			return;
		}
		titleChanged ||= sendTitle;
		restoreDecisions( sentDecisions );
		if ( ! noServerTools && ! stopped && ! taken ) {
			error = errorMessage( e );
			showStatus( `Couldn’t save: ${ error }` );
		}
	} finally {
		saving = false;
		if ( statusMessage === 'Saving…' ) {
			showStatus();
		}
		if ( saveQueued ) {
			saveQueued = false;
			save();
		}
	}
}

// Sends a debounced save now, before the page stops or switches posts. Best effort.
function flushSave() {
	if ( saving && ( saveTimer || saveQueued ) ) {
		const args = {
			...post,
			content: local.content,
			...( titleChanged && { title: local.title } ),
			...decisionArgs( decisions ),
		};
		lastUpdate
			?.then(
				( result ) =>
					! result.conflict &&
					callTool( 'wpcom-post-editor-update', { ...args, base_version: result.version } )
			)
			.catch( () => {} );
	} else if ( saveTimer ) {
		clearTimeout( saveTimer );
		save();
	}
}

// Merges the server's post into the user's typing, and sends the result back when it differs.
function applyRemote( state: StateResult ) {
	const remote = {
		title: state.title ?? base.title,
		content: state.content === undefined ? base.content : normalize( state.content ),
	};
	if ( remote.title === base.title && remote.content === base.content ) {
		return;
	}
	const merged = mergePost(
		{ title: base.title, blocks: splitBlocks( base.content ) },
		{ title: local.title, blocks: splitBlocks( local.content ) },
		{ title: remote.title, blocks: splitBlocks( remote.content ) },
		unconfirmed && { title: unconfirmed.title, blocks: splitBlocks( unconfirmed.content ) }
	);
	const next = { title: merged.title, content: joinBlocks( merged.blocks ) };
	base = remote;
	unconfirmed = undefined;
	titleChanged = next.title !== remote.title;
	if ( next.title !== local.title || next.content !== local.content ) {
		showInEditor( next );
	}
	scheduleSave();
}

function restoreDecisions( sent?: Decisions ) {
	if ( sent ) {
		( Object.keys( sent ) as Decision[] ).forEach( ( decision ) =>
			decisions[ decision ].unshift( ...sent[ decision ] )
		);
	}
}

function clearAccepted() {
	clearTimeout( accepted?.timer );
	accepted = undefined;
}

// Accept, Reject or Undo, sent with the typing in the next update.
function decide( decision: Decision, ids: string[] ) {
	// The server takes only the first of accept, reject and undo listing a change, so an Undo
	// that travels with its own Accept is a reject.
	const unsent = decision === 'undo' ? ids.filter( ( id ) => decisions.accept.includes( id ) ) : [];
	decisions.accept = decisions.accept.filter( ( id ) => ! unsent.includes( id ) );
	decisions.reject.push( ...unsent );
	decisions[ decision ].push( ...ids.filter( ( id ) => ! unsent.includes( id ) ) );
	ids.forEach( ( id ) => decided.add( id ) );
	if ( decision !== 'reject' ) {
		clearAccepted();
	}
	if ( decision === 'accept' ) {
		const one = changes.find( ( change ) => change.change_id === ids[ 0 ] );
		accepted = {
			ids,
			label: ids.length === 1 && one ? changeLabel( one ) : `${ ids.length } changes`,
			timer: setTimeout( () => {
				accepted = undefined;
				render();
			}, UNDO_TIME ),
		};
	}
	render();
	clearTimeout( saveTimer );
	save();
}

// A reject or undo the server found stale leaves the block as the assistant wrote it.
function reportUnreverted( ids: string[] ) {
	const blocks = splitBlocks( local.content );
	const kept = ids
		.map( ( id ) => seenChanges.get( id ) )
		.find( ( change ) => change?.after && blocks.includes( splitBlocks( change.after )[ 0 ] ) );
	if ( kept && kept.block_index !== null ) {
		statusMessage = `Couldn’t reject ${ changeLabel( kept ) }: it changed since`;
	}
}

function receiveChanges( list: StateResult[ 'changes' ] = [] ) {
	changes = list.filter( ( change ) => ( change.status ?? 'pending' ) === 'pending' );
	const fresh = changes.filter( ( change ) => ! seenChanges.has( change.change_id ) );
	if ( ! fresh.length ) {
		return;
	}
	fresh.forEach( ( change ) => seenChanges.set( change.change_id, change ) );
	clearAccepted();
	statusMessage =
		fresh.length === 1
			? `The assistant changed ${ changeLabel( fresh[ 0 ] ) }`
			: `The assistant made ${ fresh.length } changes`;
}

// A save that ended during a state call already has that version or a newer one.
function receiveState( state: StateResult ) {
	if ( state.version > version ) {
		version = state.version;
		if ( state.changed ) {
			receiveChanges( state.changes );
			applyRemote( state );
		}
	}
}

function schedule() {
	if ( ! timer && ! polling && ! stopped && ! noServerTools && post && ! document.hidden ) {
		timer = setTimeout( poll, POLL_INTERVAL );
	}
}

async function poll() {
	timer = undefined;
	polling = true;
	const current = opens;
	const starts = saveStarts;
	try {
		const state = await callTool< StateResult >( 'wpcom-post-editor-state', {
			since_version: version,
		} );
		// A save's own state call merges; this one may already hold the save, against an old base.
		if ( current !== opens || stopped || saving || starts !== saveStarts ) {
			return;
		}
		polls++;
		receiveState( state );
		// Retries a failed save.
		if ( ! saveTimer ) {
			scheduleSave();
		}
		if ( /^(Poll failed|Couldn’t save)/.test( statusMessage ) ) {
			error = '';
			statusMessage = '';
		}
		render();
	} catch ( e ) {
		if ( current !== opens || stopped || noServerTools ) {
			return;
		}
		error = errorMessage( e );
		showStatus( `Poll failed: ${ error }` );
	} finally {
		polling = false;
		schedule();
	}
}

document.addEventListener( 'visibilitychange', () => {
	if ( document.hidden ) {
		clearTimeout( timer );
		timer = undefined;
	} else {
		schedule();
	}
} );

function stopPolling( message: string ) {
	flushSave();
	stopped = true;
	clearTimeout( timer );
	timer = undefined;
	clearTimeout( saveTimer );
	channel?.close();
	channel = undefined;
	error = '';
	showStatus( message );
}

// Only the newest panel showing a post polls and edits it: each panel announces the post it
// opens, and an older panel that hears a newer announcement stops.
function claimPost( site: string, postId: number ) {
	channel?.close();
	channel = undefined;
	if ( typeof BroadcastChannel === 'undefined' ) {
		return;
	}
	const openedAt = Date.now();
	try {
		channel = new BroadcastChannel( `mcp-post-editor:${ site }:${ postId }` );
	} catch {
		return;
	}
	channel.onmessage = ( { data } ) => {
		if (
			data?.id !== panelId &&
			( data?.at > openedAt || ( data?.at === openedAt && data.id > panelId ) )
		) {
			stopPolling( 'A newer panel is showing this post.' );
		}
	};
	channel.postMessage( { id: panelId, at: openedAt } );
}

async function loadConfig( current: number ) {
	for ( let attempt = 1; ; attempt++ ) {
		try {
			return await callTool< ConfigResult >( 'wpcom-post-editor-config', {}, CONFIG_TIMEOUT );
		} catch ( e ) {
			if ( attempt >= CONFIG_ATTEMPTS || current !== opens || noServerTools ) {
				throw e;
			}
			await new Promise( ( resolve ) => setTimeout( resolve, attempt * 1000 ) );
		}
	}
}

// `version` is the latest, so polls list only newer changes: asks once for those already pending.
async function loadChanges( current: number ) {
	try {
		const state = await callTool< StateResult >( 'wpcom-post-editor-state', { since_version: 0 } );
		if ( current === opens && ! stopped ) {
			receiveChanges( state.changes );
			render();
		}
	} catch {
		// The polls show the tools' errors.
	}
}

let stylesLoaded = false;
async function open( result: OpenResult ) {
	if ( stopped ) {
		return;
	}
	const next = { wpcom_site: String( result.site.id ), post_id: result.post.id };
	if ( next.wpcom_site !== post?.wpcom_site || next.post_id !== post.post_id ) {
		flushSave();
	}
	const current = ++opens;
	post = next;
	siteUrl = result.site.url;
	version = result.version;
	error = '';
	clearTimeout( saveTimer );
	saveQueued = false;
	titleChanged = false;
	unconfirmed = undefined;
	changes = [];
	decisions = noDecisions();
	decided.clear();
	seenChanges.clear();
	clearAccepted();
	base = { title: result.post.title, content: normalize( result.content ) };
	showInEditor( base );
	persistentErrors.open = undefined;
	showStatus();
	claimPost( post.wpcom_site, post.post_id );
	schedule();
	if ( ! noServerTools ) {
		loadChanges( current );
	}
	if ( stylesLoaded || noServerTools ) {
		return;
	}
	try {
		const config = await loadConfig( current );
		if ( current === opens ) {
			// Set first: a retry after a partial apply would append the same nodes again.
			stylesLoaded = true;
			applySiteStyles( config );
			styles = config.styles?.filter( ( style ) => style.css ) ?? [];
			showPersistentError( 'config' );
		}
	} catch ( e ) {
		if ( current === opens && ! noServerTools ) {
			showPersistentError( 'config', `Couldn’t load the site’s styles: ${ errorMessage( e ) }` );
		}
	}
}

function openFailed( message: string ) {
	if ( post ) {
		showPersistentError( 'open', `Couldn’t open the post: ${ message }` );
		return;
	}
	error = message;
	showStatus( `Couldn’t open the post: ${ message }` );
}

function toggleFullscreen() {
	const mode = hostContext.displayMode === 'fullscreen' ? 'inline' : 'fullscreen';
	app.requestDisplayMode( { mode } ).then(
		( result ) => {
			hostContext = { ...hostContext, displayMode: result.mode };
			render();
		},
		( e ) => {
			error = errorMessage( e );
			showStatus( `Couldn’t change the panel size: ${ error }` );
		}
	);
}

app.addEventListener( 'toolresult', ( result ) => {
	if ( result.isError ) {
		openFailed( resultText( result ) );
		return;
	}
	const next = resultData( result ) as Partial< OpenResult > | undefined;
	if ( next?.site && next.post ) {
		open( next as OpenResult );
	} else {
		openFailed( 'The tool result has no post.' );
	}
} );
app.addEventListener( 'hostcontextchanged', ( context ) => {
	hostContext = { ...hostContext, ...context };
	render();
} );
app.onteardown = () => {
	flushSave();
	stopped = true;
	clearTimeout( timer );
	clearTimeout( saveTimer );
	channel?.close();
	return {};
};

// Links open through the host: navigating would replace this page in its iframe. Links in
// editable text are left to the editor, where a click places the caret.
function openLinkThroughHost( event: MouseEvent ) {
	// Other buttons (right-click) keep the browser's own menu.
	if ( event.button > 1 ) {
		return;
	}
	// `a` matches HTML and SVG anchors; `area` is an image map link.
	const link = event.target instanceof Element ? event.target.closest( 'a, area' ) : null;
	// Not `[contenteditable]`: the editor makes the whole canvas editable while selecting.
	if ( ! link || link.closest( '.rich-text' ) ) {
		return;
	}
	event.preventDefault();
	const href =
		link.getAttribute( 'href' ) ?? link.getAttributeNS( 'http://www.w3.org/1999/xlink', 'href' );
	if ( href === null ) {
		return;
	}
	if ( href.startsWith( '#' ) ) {
		let fragment = href.slice( 1 );
		try {
			fragment = decodeURIComponent( fragment );
		} catch {}
		const id = CSS.escape( fragment );
		if ( id ) {
			document
				.querySelector( '.editor-styles-wrapper' )
				?.querySelector( `[id="${ id }"], a[name="${ id }"]` )
				?.scrollIntoView();
		}
		return;
	}
	let url: URL;
	try {
		url = new URL( href.startsWith( '//' ) ? `https:${ href }` : href, siteUrl );
	} catch {
		return;
	}
	if ( ! LINK_PROTOCOLS.includes( url.protocol ) ) {
		return;
	}
	const linkFailed = ( message: string ) => {
		error = message;
		showStatus( `Couldn’t open the link: ${ message }` );
	};
	app.openLink( { url: url.href } ).then(
		( { isError } ) => isError && linkFailed( 'The host declined it.' ),
		( e ) => linkFailed( errorMessage( e ) )
	);
}
document.addEventListener( 'click', openLinkThroughHost );
// Middle-click fires `auxclick`, not `click`.
document.addEventListener( 'auxclick', openLinkThroughHost );

showStatus( 'Connecting to the host…' );
// autoResize (on by default) reports the page height to the host after every change.
app.connect().then(
	() => {
		hostContext = app.getHostContext() ?? {};
		if ( ! post && ! error ) {
			statusMessage = 'Connected. Waiting for the post…';
		}
		render();
	},
	( e ) => {
		error = errorMessage( e );
		showStatus( `Couldn’t connect to the host: ${ error }` );
	}
);
