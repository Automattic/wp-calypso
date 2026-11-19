import { App } from '@modelcontextprotocol/ext-apps/app-with-deps';
import DOMPurify from 'dompurify';
import { applySiteStyles, type SiteStyle } from './site-styles';
import './style.scss';

type ToolResult = Awaited< ReturnType< App[ 'callServerTool' ] > >;
type OpenResult = {
	site: { id: number; url: string };
	post: { id: number; title: string };
	content: string;
	version: number;
};
type StateResult = { version: number; changed: boolean; title?: string; content?: string };
type ConfigResult = { styles?: SiteStyle[]; assets_styles?: string; font_faces_html?: string };

const POLL_INTERVAL = 2000;
const CONFIG_ATTEMPTS = 3;
const CONFIG_TIMEOUT = 10000;
const LINK_PROTOCOLS = [ 'http:', 'https:', 'mailto:' ];
// Post content is the site's saved HTML; nothing in it should run or navigate this page.
const PURIFY_CONFIG = {
	FORBID_TAGS: [ 'iframe', 'object', 'embed', 'form', 'base', 'meta', 'style', 'script', 'link' ],
	ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,
};

const root =
	document.getElementById( 'mcp-post-editor' ) ??
	document.body.appendChild(
		Object.assign( document.createElement( 'div' ), { id: 'mcp-post-editor' } )
	);
root.innerHTML = `
	<p class="mcp-post-editor__status" role="status"></p>
	<p class="mcp-post-editor__error" role="alert" hidden></p>
	<div class="editor-styles-wrapper">
		<div class="is-layout-constrained has-global-padding">
			<h1 class="wp-block-post-title editor-post-title"></h1>
		</div>
		<div class="is-root-container is-layout-constrained has-global-padding wp-block-post-content"></div>
	</div>
`;
const status = root.querySelector( '.mcp-post-editor__status' ) as HTMLElement;
const errorNotice = root.querySelector( '.mcp-post-editor__error' ) as HTMLElement;
const title = root.querySelector( '.wp-block-post-title' ) as HTMLElement;
const content = root.querySelector( '.is-root-container' ) as HTMLElement;

const app = new App( { name: 'wpcom-post-editor', version: '0.0.1' } );
const panelId = `${ Date.now() }-${ Math.random().toString( 36 ).slice( 2 ) }`;
let post: { wpcom_site: string; post_id: number } | undefined;
let siteUrl = '';
let version = 0;
let polls = 0;
let error = '';
let timer: ReturnType< typeof setTimeout > | undefined;
let polling = false;
let stopped = false;
let opens = 0;
// Set when the host can't run tools for the page, which then shows only the opened post.
let noServerTools = false;
let channel: BroadcastChannel | undefined;
// Errors the poll status must not overwrite, shown until their cause is resolved.
const persistentErrors: { open?: string; config?: string; host?: string } = {};

function showStatus( message?: string ) {
	status.textContent = message ?? `Polls: ${ polls }, version ${ version }`;
	status.classList.toggle( 'is-error', !! error );
}

function showPersistentError( key: keyof typeof persistentErrors, message?: string ) {
	persistentErrors[ key ] = message;
	const messages = Object.values( persistentErrors ).filter( Boolean );
	errorNotice.textContent = messages.join( '\n' );
	errorNotice.hidden = ! messages.length;
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

function render( next: { title?: string; content?: string } ) {
	if ( next.title !== undefined ) {
		title.textContent = next.title;
	}
	if ( next.content !== undefined ) {
		const template = document.createElement( 'template' );
		template.innerHTML = DOMPurify.sanitize( next.content, PURIFY_CONFIG );
		content.replaceChildren( template.content );
	}
}

// The host's JSON-RPC error when it can't run tools at all ("IPC not available for MCP tool
// call"). Its code, -32603, also covers any failure in the host's handler, and a tool error
// may say "not available", so only this message tells them apart.
const isHostToolError = ( e: unknown ) => /IPC not available/i.test( errorMessage( e ) );

async function callTool< T >( name: string, timeout?: number ) {
	let result: ToolResult;
	try {
		result = await app.callServerTool(
			{
				name,
				arguments: name === 'wpcom-post-editor-state' ? { ...post, since_version: version } : post,
			},
			timeout ? { timeout } : undefined
		);
	} catch ( e ) {
		if ( isHostToolError( e ) && ! noServerTools ) {
			noServerTools = true;
			clearTimeout( timer );
			timer = undefined;
			showPersistentError( 'config' );
			showPersistentError(
				'host',
				'This host can’t call tools from the panel, so site styles and live updates are off.'
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

function schedule() {
	if ( ! timer && ! polling && ! stopped && ! noServerTools && post && ! document.hidden ) {
		timer = setTimeout( poll, POLL_INTERVAL );
	}
}

async function poll() {
	timer = undefined;
	polling = true;
	const current = opens;
	try {
		const state = await callTool< StateResult >( 'wpcom-post-editor-state' );
		if ( current !== opens || stopped ) {
			return;
		}
		polls++;
		error = '';
		if ( state.version > version ) {
			render( state );
		}
		version = state.version;
		showStatus();
	} catch ( e ) {
		if ( current !== opens || stopped || noServerTools ) {
			return;
		}
		error = errorMessage( e );
		showStatus( `Polls: ${ polls }, version ${ version }. Poll failed: ${ error }` );
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
	stopped = true;
	clearTimeout( timer );
	timer = undefined;
	channel?.close();
	channel = undefined;
	error = '';
	showStatus( message );
}

// Only the newest panel showing a post polls it: each panel announces the post it
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
			return await callTool< ConfigResult >( 'wpcom-post-editor-config', CONFIG_TIMEOUT );
		} catch ( e ) {
			if ( attempt >= CONFIG_ATTEMPTS || current !== opens || noServerTools ) {
				throw e;
			}
			await new Promise( ( resolve ) => setTimeout( resolve, attempt * 1000 ) );
		}
	}
}

let stylesLoaded = false;
async function open( result: OpenResult ) {
	if ( stopped ) {
		return;
	}
	const current = ++opens;
	post = { wpcom_site: String( result.site.id ), post_id: result.post.id };
	siteUrl = result.site.url;
	version = result.version;
	error = '';
	showPersistentError( 'open' );
	render( { title: result.post.title, content: result.content } );
	showStatus();
	claimPost( post.wpcom_site, post.post_id );
	schedule();
	if ( stylesLoaded || noServerTools ) {
		return;
	}
	try {
		const config = await loadConfig( current );
		if ( current === opens ) {
			// Set first: a retry after a partial apply would append the same nodes again.
			stylesLoaded = true;
			applySiteStyles( config );
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
app.onteardown = () => {
	stopped = true;
	clearTimeout( timer );
	channel?.close();
	return {};
};

// Links open through the host: navigating would replace this page in its iframe.
function openLinkThroughHost( event: MouseEvent ) {
	// Other buttons (right-click) keep the browser's own menu.
	if ( event.button > 1 ) {
		return;
	}
	// `a` matches HTML and SVG anchors; `area` is an image map link.
	const link = event.target instanceof Element ? event.target.closest( 'a, area' ) : null;
	if ( ! link ) {
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
			content.querySelector( `[id="${ id }"], a[name="${ id }"]` )?.scrollIntoView();
		}
		return;
	}
	let url: URL;
	try {
		// Relative links resolve against the post's site, as they would on the site.
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
content.addEventListener( 'click', openLinkThroughHost );
// Middle-click fires `auxclick`, not `click`.
content.addEventListener( 'auxclick', openLinkThroughHost );

showStatus( 'Connecting to the host…' );
// autoResize (on by default) reports the page height to the host after every change.
app.connect().then(
	() => {
		if ( ! post && ! error ) {
			showStatus( 'Connected. Waiting for the post…' );
		}
	},
	( e ) => {
		error = errorMessage( e );
		showStatus( `Couldn’t connect to the host: ${ error }` );
	}
);
