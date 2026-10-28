/** The strings and routes the Jetpack Comments block editor takes from PHP. */
export interface SiteCommentsEditorLabels {
	blockTools: string;
	addBlock: string;
	/** The embed preview route, or empty where embeds are off. */
	embedUrl: string;
	images: boolean;
	imageError: string;
}

/** What `/sites/{siteId}/comments/editor` returns for a site that offers block comments. */
export interface SiteCommentsEditorSettings {
	/** The build directory the editor loads its chunks from. */
	assetsUrl: string;
	/** The versioned loader script, which sets `window.JetpackCommentsEditor`. */
	loaderUrl: string;
	maxLength: number;
	/** Core's translations of the editor's strings, keyed as its script translations are. */
	editorLocale: Record< string, unknown >;
	editor: SiteCommentsEditorLabels;
}
