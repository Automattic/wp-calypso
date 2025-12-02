export interface ActivityBlockNode {
	type?: string;
	text?: string | null;
	children?: ActivityBlockContent[];
	// these are all optional and depend on the type of node
	url?: string | null;
	// the activity field was mostly referenced as a data attribute for links.
	// we now check it elsewhere so downstream consumers can rely on the data when present.
	activity?: string;
	section?: string;
	intent?: string;
	siteId?: number | string;
	postId?: number | string;
	isTrashed?: boolean;
	commentId?: number | string;
	name?: string;
	siteSlug?: string;
	pluginSlug?: string;
	themeUri?: string;
	themeSlug?: string;
}

export type ActivityBlockContent = string | ActivityBlockNode;

export interface ActivityBlockMeta {
	activity?: string;
	intent?: string;
	section?: string;
	published?: number | string;
}
