// The title suggestions card, shown in the chat under the model's reply to
// `wpcom-post-editor-suggest-titles`. Plain DOM, with no block editor. About 526 KB minified,
// nearly all ext-apps' bundled dependencies (zod, the MCP client).
import { App } from '@modelcontextprotocol/ext-apps/app-with-deps';
import './style.scss';

type ToolResult = Awaited< ReturnType< App[ 'callServerTool' ] > >;
type Suggestions = {
	id: string;
	wpcom_site: string;
	post_id: number;
	postTitle: string;
	titles: string[];
};

const MAX_TITLES = 5;

const root =
	document.getElementById( 'mcp-post-editor-titles' ) ??
	document.body.appendChild(
		Object.assign( document.createElement( 'div' ), { id: 'mcp-post-editor-titles' } )
	);

const app = new App( { name: 'wpcom-post-editor-titles', version: '0.0.1' }, {} );

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

// A positive integer id, as a number or a numeric string.
const toId = ( value: unknown ) =>
	( typeof value === 'number' || typeof value === 'string' ) && /^[1-9]\d*$/.test( String( value ) )
		? Number( value )
		: undefined;

function toSuggestions( data?: Record< string, unknown > ): Suggestions | undefined {
	const { id, site, post, titles } = ( data ?? {} ) as {
		id?: unknown;
		site?: { id?: unknown };
		post?: { id?: unknown; title?: unknown };
		titles?: unknown;
	};
	const siteId = toId( site?.id );
	const postId = toId( post?.id );
	if ( typeof id !== 'string' || ! siteId || ! postId || ! Array.isArray( titles ) ) {
		return undefined;
	}
	const list = titles
		.filter( ( title ): title is string => typeof title === 'string' && !! title )
		.slice( 0, MAX_TITLES );
	return list.length
		? {
				id,
				wpcom_site: String( siteId ),
				post_id: postId,
				postTitle: typeof post?.title === 'string' ? post.title : '',
				titles: list,
			}
		: undefined;
}

const element = < K extends keyof HTMLElementTagNameMap >(
	tag: K,
	props: Partial< HTMLElementTagNameMap[ K ] > = {}
) => Object.assign( document.createElement( tag ), props );

function showMessage( text: string ) {
	const card = element( 'div', { className: 'mcp-post-editor-titles' } );
	sizeToContent();
	card.append(
		element( 'p', { className: 'mcp-post-editor-titles__message is-error', textContent: text } )
	);
	root.replaceChildren( card );
}

// The shell's loader may fill the frame (100vh): from the card on, the page is as tall as its
// content, so the host's autoresized height follows the card, and 0 once it's hidden.
function sizeToContent() {
	document.documentElement.classList.add( 'has-mcp-post-editor-titles' );
}

// A 16px icon as inline SVG, built without markup strings.
const CHECK = 'M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z';
const CLOSE =
	'M12 13.06l3.712 3.713 1.061-1.06L13.061 12l3.712-3.712-1.06-1.06L12 10.938 8.288 7.227l-1.061 1.06L10.939 12l-3.712 3.712 1.06 1.061L12 13.061z';
function icon( path: string ) {
	const ns = 'http://www.w3.org/2000/svg';
	const svg = document.createElementNS( ns, 'svg' );
	svg.setAttribute( 'class', 'mcp-post-editor-titles__icon' );
	svg.setAttribute( 'viewBox', '0 0 24 24' );
	svg.setAttribute( 'aria-hidden', 'true' );
	svg.setAttribute( 'focusable', 'false' );
	const d = document.createElementNS( ns, 'path' );
	d.setAttribute( 'd', path );
	svg.append( d );
	return svg;
}

function showCard( suggestions: Suggestions ) {
	const card = element( 'div', { className: 'mcp-post-editor-titles' } );
	sizeToContent();
	const header = element( 'div', { className: 'mcp-post-editor-titles__header' } );
	const heading = element( 'div', { className: 'mcp-post-editor-titles__heading' } );
	heading.append(
		element( 'p', { className: 'mcp-post-editor-titles__title', textContent: 'Title ideas' } )
	);
	if ( suggestions.postTitle ) {
		heading.append(
			element( 'p', {
				className: 'mcp-post-editor-titles__subtitle',
				textContent: `for “${ suggestions.postTitle }”`,
				title: suggestions.postTitle,
			} )
		);
	}
	const close = element( 'button', {
		type: 'button',
		className: 'mcp-post-editor-titles__close',
		onclick: () => root.replaceChildren(),
	} );
	close.setAttribute( 'aria-label', 'Hide the title ideas' );
	close.append( icon( CLOSE ) );
	header.append( heading, close );

	const list = element( 'div', { className: 'mcp-post-editor-titles__list' } );
	list.setAttribute( 'role', 'group' );
	list.setAttribute( 'aria-label', 'Suggested titles' );
	const message = element( 'p', { className: 'mcp-post-editor-titles__message' } );
	message.setAttribute( 'role', 'status' );
	const options = suggestions.titles.map( ( title ) =>
		element( 'button', {
			type: 'button',
			className: 'mcp-post-editor-titles__option',
			textContent: title,
			onclick: () => pick( title ),
		} )
	);
	list.append( ...options );
	card.append( header, list, message );
	root.replaceChildren( card );

	const setMessage = ( text: string, isError = false ) => {
		message.textContent = text;
		message.classList.toggle( 'is-error', isError );
		message.classList.remove( 'is-success' );
	};

	async function pick( title: string ) {
		options.forEach( ( option ) => ( option.disabled = true ) );
		setMessage( 'Updating the title…' );
		let failure: string;
		try {
			const result = await app.callServerTool( {
				name: 'wpcom-post-editor-set-title',
				arguments: {
					wpcom_site: suggestions.wpcom_site,
					post_id: suggestions.post_id,
					title,
					suggestions_id: suggestions.id,
				},
			} );
			if ( ! result.isError ) {
				options.forEach( ( option ) => {
					if ( option.textContent === title ) {
						option.classList.add( 'is-chosen' );
						option.setAttribute( 'aria-pressed', 'true' );
						option.prepend( icon( CHECK ) );
					}
				} );
				// The title is in the editing session, and on the site once the user saves.
				setMessage( 'Title set in the editor. Save it from the editor panel.' );
				message.classList.add( 'is-success' );
				message.prepend( icon( CHECK ) );
				return;
			}
			failure = `Couldn’t set the title: ${ resultText( result ) }`;
		} catch ( e ) {
			// The host's error when it can't run tools at all: see isHostToolError in ../index.ts.
			failure = /IPC not available/i.test( errorMessage( e ) )
				? 'Can’t set the title from here. Ask in the chat instead.'
				: `Couldn’t set the title: ${ errorMessage( e ) }`;
		}
		options.forEach( ( option ) => ( option.disabled = false ) );
		setMessage( failure, true );
	}
}

app.addEventListener( 'toolresult', ( result ) => {
	if ( result.isError ) {
		showMessage( `Couldn’t load the title ideas: ${ resultText( result ) }` );
		return;
	}
	const suggestions = toSuggestions( resultData( result ) );
	if ( suggestions ) {
		showCard( suggestions );
	} else {
		showMessage( 'Couldn’t load the title ideas: the tool result has none.' );
	}
} );

// autoResize (on by default) reports the card's height to the host after every change.
app
	.connect()
	.catch( ( e ) => showMessage( `Couldn’t connect to the host: ${ errorMessage( e ) }` ) );
