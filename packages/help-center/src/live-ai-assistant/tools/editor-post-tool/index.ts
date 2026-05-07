import { dispatch, select } from '@wordpress/data';

export const SET_POST_TITLE_TOOL_NAME = 'set_post_title_tool';
export const SAVE_POST_TOOL_NAME = 'save_post_tool';
export const PUBLISH_POST_TOOL_NAME = 'publish_post_tool';
export const UNDO_TOOL_NAME = 'undo_tool';
export const REDO_TOOL_NAME = 'redo_tool';
export const GET_POST_INFO_TOOL_NAME = 'get_post_info_tool';

export const setPostTitleToolDefinition = {
	type: 'function',
	name: SET_POST_TITLE_TOOL_NAME,
	description:
		'Set or update the post title. Uses wp.data dispatch("core/editor").editPost({ title }). Use this when the user dictates a title or says "set the title to …" / "make this the title". The title is NOT a block — it has its own field above the blocks.',
	parameters: {
		type: 'object',
		properties: {
			title: {
				type: 'string',
				description: 'The new post title text.',
			},
		},
		required: [ 'title' ],
		additionalProperties: false,
	},
} as const;

export const savePostToolDefinition = {
	type: 'function',
	name: SAVE_POST_TOOL_NAME,
	description:
		'Save the current post (autosave or draft save). Uses wp.data dispatch("core/editor").savePost. Use this when the user says "save", "save draft", "save my work". Does not change publish status. Returns once the save promise settles.',
	parameters: {
		type: 'object',
		properties: {
			is_autosave: {
				type: 'boolean',
				description:
					'Optional. If true, performs an autosave instead of a full save. Defaults to false.',
			},
		},
		additionalProperties: false,
	},
} as const;

export const publishPostToolDefinition = {
	type: 'function',
	name: PUBLISH_POST_TOOL_NAME,
	description:
		'Publish the current post. First sets status to "publish" via dispatch("core/editor").editPost, then calls savePost. Use only when the user explicitly asks to publish (e.g. "publish it", "publish the post", "go ahead and publish"). Do NOT publish proactively.',
	parameters: {
		type: 'object',
		properties: {},
		additionalProperties: false,
	},
} as const;

export const undoToolDefinition = {
	type: 'function',
	name: UNDO_TOOL_NAME,
	description:
		'Undo the last editor change. Uses wp.data dispatch("core/editor").undo (falls back to dispatch("core").undo). Use this when the user says "undo that", "undo", "go back".',
	parameters: { type: 'object', properties: {}, additionalProperties: false },
} as const;

export const redoToolDefinition = {
	type: 'function',
	name: REDO_TOOL_NAME,
	description:
		'Redo the last undone editor change. Uses wp.data dispatch("core/editor").redo (falls back to dispatch("core").redo). Use this when the user says "redo".',
	parameters: { type: 'object', properties: {}, additionalProperties: false },
} as const;

export const getPostInfoToolDefinition = {
	type: 'function',
	name: GET_POST_INFO_TOOL_NAME,
	description:
		'Get high-level info about the current post: title, status (draft/publish/etc), id, slug, whether the post has unsaved edits, and whether it is currently saving. Uses wp.data select("core/editor"). Use sparingly — typically only when the user asks "is it saved?" / "did it publish?".',
	parameters: { type: 'object', properties: {}, additionalProperties: false },
} as const;

type EditorActions = {
	editPost?: ( edits: Record< string, unknown > ) => void | Promise< unknown >;
	savePost?: ( options?: Record< string, unknown > ) => void | Promise< unknown >;
	undo?: () => void | Promise< unknown >;
	redo?: () => void | Promise< unknown >;
};

type CoreActions = {
	undo?: () => void | Promise< unknown >;
	redo?: () => void | Promise< unknown >;
};

type EditorSelectors = {
	getEditedPostAttribute?: ( name: string ) => unknown;
	getCurrentPost?: () => Record< string, unknown > | null | undefined;
	getCurrentPostId?: () => number | null;
	isEditedPostDirty?: () => boolean;
	isSavingPost?: () => boolean;
	isCurrentPostPublished?: () => boolean;
	isAutosavingPost?: () => boolean;
};

function getEditorDispatch(): EditorActions | null {
	try {
		return dispatch( 'core/editor' ) as unknown as EditorActions;
	} catch {
		return null;
	}
}

function getCoreDispatch(): CoreActions | null {
	try {
		return dispatch( 'core' ) as unknown as CoreActions;
	} catch {
		return null;
	}
}

function getEditorSelect(): EditorSelectors | null {
	try {
		return select( 'core/editor' ) as unknown as EditorSelectors;
	} catch {
		return null;
	}
}

function parseSetPostTitleArgs(
	rawArgs: unknown
): { ok: true; title: string } | { ok: false; error: string } {
	try {
		const args =
			typeof rawArgs === 'string'
				? ( JSON.parse( rawArgs ) as Record< string, unknown > )
				: ( rawArgs as Record< string, unknown > | undefined );
		if ( ! args || typeof args !== 'object' ) {
			return { ok: false, error: 'Tool arguments must be an object.' };
		}
		const title = args.title;
		if ( typeof title !== 'string' ) {
			return { ok: false, error: 'title is required and must be a string.' };
		}
		return { ok: true, title };
	} catch {
		return { ok: false, error: 'Tool arguments were not valid JSON.' };
	}
}

export async function executeSetPostTitleTool( rawArgs: unknown ) {
	const d = getEditorDispatch();
	if ( ! d || typeof d.editPost !== 'function' ) {
		return {
			ok: false,
			error: 'Post editor is not available (core/editor store missing or editPost missing).',
		};
	}
	const parsed = parseSetPostTitleArgs( rawArgs );
	if ( ! parsed.ok ) {
		return { ok: false, error: parsed.error };
	}
	try {
		const out = d.editPost( { title: parsed.title } );
		if ( out && typeof ( out as Promise< unknown > ).then === 'function' ) {
			await ( out as Promise< unknown > );
		}
	} catch ( err ) {
		const message = err instanceof Error ? err.message : 'unknown error';
		return { ok: false, error: `editPost failed: ${ message }` };
	}
	return { ok: true, title: parsed.title };
}

function parseSavePostArgs( rawArgs: unknown ): { isAutosave: boolean } {
	try {
		const args =
			typeof rawArgs === 'string'
				? ( JSON.parse( rawArgs ) as Record< string, unknown > )
				: ( rawArgs as Record< string, unknown > | undefined );
		if ( ! args || typeof args !== 'object' ) {
			return { isAutosave: false };
		}
		return { isAutosave: args.is_autosave === true };
	} catch {
		return { isAutosave: false };
	}
}

export async function executeSavePostTool( rawArgs: unknown ) {
	const d = getEditorDispatch();
	if ( ! d || typeof d.savePost !== 'function' ) {
		return {
			ok: false,
			error: 'Post editor is not available (core/editor store missing or savePost missing).',
		};
	}
	const { isAutosave } = parseSavePostArgs( rawArgs );
	try {
		const out = d.savePost( isAutosave ? { isAutosave: true } : undefined );
		if ( out && typeof ( out as Promise< unknown > ).then === 'function' ) {
			await ( out as Promise< unknown > );
		}
	} catch ( err ) {
		const message = err instanceof Error ? err.message : 'unknown error';
		return { ok: false, error: `savePost failed: ${ message }` };
	}
	return { ok: true, is_autosave: isAutosave };
}

export async function executePublishPostTool() {
	const d = getEditorDispatch();
	if ( ! d || typeof d.editPost !== 'function' || typeof d.savePost !== 'function' ) {
		return {
			ok: false,
			error:
				'Post editor is not available (core/editor store missing or editPost/savePost missing).',
		};
	}
	try {
		const editOut = d.editPost( { status: 'publish' } );
		if ( editOut && typeof ( editOut as Promise< unknown > ).then === 'function' ) {
			await ( editOut as Promise< unknown > );
		}
	} catch ( err ) {
		const message = err instanceof Error ? err.message : 'unknown error';
		return { ok: false, error: `editPost(status=publish) failed: ${ message }` };
	}
	try {
		const out = d.savePost();
		if ( out && typeof ( out as Promise< unknown > ).then === 'function' ) {
			await ( out as Promise< unknown > );
		}
	} catch ( err ) {
		const message = err instanceof Error ? err.message : 'unknown error';
		return { ok: false, error: `savePost (publish) failed: ${ message }` };
	}

	const sel = getEditorSelect();
	const isPublished =
		typeof sel?.isCurrentPostPublished === 'function' ? sel.isCurrentPostPublished() : null;
	return { ok: true, is_published: isPublished };
}

export async function executeUndoTool() {
	const editor = getEditorDispatch();
	const core = getCoreDispatch();
	let undoFn: ( () => unknown ) | null = null;
	if ( typeof editor?.undo === 'function' ) {
		undoFn = editor.undo.bind( editor );
	} else if ( typeof core?.undo === 'function' ) {
		undoFn = core.undo.bind( core );
	}
	if ( ! undoFn ) {
		return { ok: false, error: 'Undo is not available in this editor build.' };
	}
	try {
		const out = undoFn();
		if ( out && typeof ( out as Promise< unknown > ).then === 'function' ) {
			await ( out as Promise< unknown > );
		}
	} catch ( err ) {
		const message = err instanceof Error ? err.message : 'unknown error';
		return { ok: false, error: `undo failed: ${ message }` };
	}
	return { ok: true };
}

export async function executeRedoTool() {
	const editor = getEditorDispatch();
	const core = getCoreDispatch();
	let redoFn: ( () => unknown ) | null = null;
	if ( typeof editor?.redo === 'function' ) {
		redoFn = editor.redo.bind( editor );
	} else if ( typeof core?.redo === 'function' ) {
		redoFn = core.redo.bind( core );
	}
	if ( ! redoFn ) {
		return { ok: false, error: 'Redo is not available in this editor build.' };
	}
	try {
		const out = redoFn();
		if ( out && typeof ( out as Promise< unknown > ).then === 'function' ) {
			await ( out as Promise< unknown > );
		}
	} catch ( err ) {
		const message = err instanceof Error ? err.message : 'unknown error';
		return { ok: false, error: `redo failed: ${ message }` };
	}
	return { ok: true };
}

export function executeGetPostInfoTool() {
	const sel = getEditorSelect();
	if ( ! sel ) {
		return { ok: false, error: 'Post editor is not available (core/editor store missing).' };
	}
	const title =
		typeof sel.getEditedPostAttribute === 'function' ? sel.getEditedPostAttribute( 'title' ) : null;
	const status =
		typeof sel.getEditedPostAttribute === 'function'
			? sel.getEditedPostAttribute( 'status' )
			: null;
	const slug =
		typeof sel.getEditedPostAttribute === 'function' ? sel.getEditedPostAttribute( 'slug' ) : null;
	const id =
		typeof sel.getCurrentPostId === 'function'
			? sel.getCurrentPostId()
			: ( sel.getCurrentPost?.() as { id?: number } | undefined )?.id ?? null;
	const isDirty = typeof sel.isEditedPostDirty === 'function' ? sel.isEditedPostDirty() : null;
	const isSaving = typeof sel.isSavingPost === 'function' ? sel.isSavingPost() : null;
	const isPublished =
		typeof sel.isCurrentPostPublished === 'function' ? sel.isCurrentPostPublished() : null;
	const isAutosaving = typeof sel.isAutosavingPost === 'function' ? sel.isAutosavingPost() : null;
	return {
		ok: true,
		id,
		title: typeof title === 'string' ? title : null,
		status: typeof status === 'string' ? status : null,
		slug: typeof slug === 'string' ? slug : null,
		is_dirty: isDirty,
		is_saving: isSaving,
		is_published: isPublished,
		is_autosaving: isAutosaving,
	};
}
