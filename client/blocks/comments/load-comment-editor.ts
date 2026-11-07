import { fetchCommentEmbedPreview } from '@automattic/api-core';
import { loadScript } from '@automattic/load-script';
import type { CommentsEditorLabels, CommentsEditorSettings } from '@automattic/api-core';

export type CommentEditorProps = {
	initialContent: string;
	labels: CommentsEditorLabels & { embedUrl: string };
	/** The caret's offset into the text, or -1 for the end. Left out, the editor takes no focus. */
	focus?: () => number;
	placeholder: string;
	/** Asks for an embed's preview in place of the editor's own request, which can't sign in. */
	fetchEmbed?: ( url: string ) => Promise< Response >;
	onChange: ( content: string ) => void;
	/** The editor broke; the caller brings its textarea back. */
	onError: ( error: unknown ) => void;
};

export type CommentEditorModule = {
	mountEditor: ( container: HTMLElement, props: CommentEditorProps ) => ( () => void ) | void;
};

declare global {
	interface Window {
		/** Set by the Jetpack Comments loader script. */
		JetpackCommentsEditor?: {
			load: ( options?: {
				locale?: CommentsEditorSettings[ 'editorLocale' ];
				assetsUrl?: string;
			} ) => Promise< CommentEditorModule >;
		};
	}
}

/**
 * The embed preview as the signed-in reader, since the route serves only them. The editor reads the
 * status, so an error the route answered keeps its status, and a request that never got one throws.
 */
export const fetchEmbed = ( url: string ): Promise< Response > =>
	fetchCommentEmbedPreview( url ).then(
		( data ) => new Response( JSON.stringify( data ), { status: 200 } ),
		( error: { statusCode?: number } ) => {
			const status = error?.statusCode ?? 0;
			if ( status < 400 || status > 599 ) {
				throw error;
			}
			return new Response( JSON.stringify( error ), { status } );
		}
	);

/** Whether the text is the editor's block markup, which only the editor can show. */
export const isBlockMarkup = ( text: string ) => text.includes( '<!-- wp:' );

// Shared by every form on the page, keyed on the loader's URL, which a deploy changes.
// A failure clears it, so the next focus tries again.
let loaded: { url: string; module: Promise< CommentEditorModule > } | null = null;

export const loadCommentEditor = ( settings: CommentsEditorSettings ) => {
	if ( loaded?.url !== settings.loaderUrl ) {
		const module = loadScript( settings.loaderUrl )
			.then( () => {
				const loader = window.JetpackCommentsEditor;
				if ( ! loader ) {
					throw new Error( 'The comment editor loader did not register itself.' );
				}
				return loader.load( { locale: settings.editorLocale, assetsUrl: settings.assetsUrl } );
			} )
			.catch( ( error ) => {
				if ( loaded?.module === module ) {
					loaded = null;
				}
				throw error;
			} );
		loaded = { url: settings.loaderUrl, module };
	}

	return loaded.module;
};
