import { uriTransformer } from './uri-transformer';

export interface SitePanelItem {
	url: string;
	title: string;
	hasTitle?: boolean;
	postId?: number;
	isSiteEditor: boolean;
}

export interface SitePanelMessage {
	role: string;
	content: string;
	context?: unknown;
	message_id?: number;
	timestamp?: number;
	ts?: number;
	created_at?: string;
}

export function getSitePanelItem( href: string, siteUrl: string ): SitePanelItem | undefined {
	try {
		const safeHref = uriTransformer( href );
		if ( ! safeHref || href.startsWith( '#' ) ) {
			return;
		}
		const site = new URL( siteUrl );
		const url = new URL( safeHref, site );
		if ( ! [ 'http:', 'https:' ].includes( url.protocol ) || url.origin !== site.origin ) {
			return;
		}
		const isSiteEditor = url.pathname.endsWith( '/wp-admin/site-editor.php' );
		const isPostEditor = url.pathname.endsWith( '/wp-admin/post.php' );
		const postId = Number( url.searchParams.get( isPostEditor ? 'post' : 'p' ) );
		if ( url.pathname.includes( '/wp-admin/' ) && ! isSiteEditor && ! isPostEditor ) {
			return;
		}
		if ( isPostEditor && ! ( postId > 0 && Number.isInteger( postId ) ) ) {
			return;
		}
		url.hash = '';
		for ( const key of [ 'frame-nonce', 'am-embedded', 'wp-agent-chat', 'wp-agent-site' ] ) {
			url.searchParams.delete( key );
		}
		return {
			url: url.href,
			title: url.pathname + url.search,
			postId: postId > 0 && Number.isInteger( postId ) ? postId : undefined,
			isSiteEditor,
		};
	} catch {
		return undefined;
	}
}

/** Derives references in last-mention order without fetching or mutating the transcript. */
export function getSitePanelItems(
	messages: SitePanelMessage[],
	siteUrl: string
): SitePanelItem[] {
	const items = new Map< string, SitePanelItem >();
	for ( const message of messages ) {
		const links: { url: string; title?: string }[] = [];
		if ( [ 'agent', 'assistant', 'bot' ].includes( message.role ) ) {
			for ( const match of message.content.matchAll(
				/\[([^\]]*)\]\(<?([^\s)>]+)>?(?:\s+"[^"]*")?\)|https?:\/\/[^\s<>"\])]+/g
			) ) {
				links.push( {
					url: match[ 2 ] || match[ 0 ].replace( /[.,;!]+$/, '' ),
					title: match[ 2 ] ? match[ 1 ].trim() : undefined,
				} );
			}
		} else if (
			message.role === 'user' &&
			message.context &&
			typeof message.context === 'object' &&
			'url' in message.context &&
			typeof message.context.url === 'string'
		) {
			const item = getSitePanelItem( message.context.url, siteUrl );
			if ( item && ( item.isSiteEditor || item.url.includes( '/wp-admin/post.php' ) ) ) {
				links.push( { url: item.url } );
			}
		}
		for ( const link of links ) {
			const item = getSitePanelItem( link.url, siteUrl );
			if ( item ) {
				const key = item.postId ? `post:${ item.postId }` : item.url;
				const previous = items.get( key );
				const title = link.title || ( previous?.hasTitle ? previous.title : undefined );
				items.delete( key );
				items.set( key, title ? { ...item, title, hasTitle: true } : item );
			}
		}
	}
	return [ ...items.values() ];
}

/** Keeps server context while merging runtime messages, including replies not persisted yet. */
export function mergeSitePanelMessages(
	stored: SitePanelMessage[],
	live: SitePanelMessage[]
): SitePanelMessage[] {
	const storedIds = new Set( stored.map( ( message ) => message.message_id ).filter( Boolean ) );
	return [
		...stored,
		...live.filter( ( message ) => ! message.message_id || ! storedIds.has( message.message_id ) ),
	].sort( ( first, second ) => {
		const timestamp = ( message: SitePanelMessage ) =>
			message.timestamp ??
			( message.ts
				? message.ts * 1000
				: Date.parse( ( message.created_at || '' ).replace( ' ', 'T' ) + 'Z' ) ||
					Number.MAX_SAFE_INTEGER );
		return timestamp( first ) - timestamp( second );
	} );
}
