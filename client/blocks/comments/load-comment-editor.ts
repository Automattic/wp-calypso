import { loadScript } from '@automattic/load-script';
import type { CommentsEditorLabels, CommentsEditorSettings } from '@automattic/api-core';

export type CommentEditorProps = {
	initialContent: string;
	labels: CommentsEditorLabels & { embedUrl: string };
	/** The caret's offset into the text, or -1 for the end. Left out, the editor takes no focus. */
	focus?: () => number;
	placeholder: string;
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
