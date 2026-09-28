import { store as coreStore } from '@wordpress/core-data';
import { dispatch, select } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { isEditorPage } from '../../utils/is-editor-page';
import { waitForStore } from '../../utils/wait-for-store';
import type { AbilityResult } from '../types';

/**
 * Core's "Show template" mode: the page renders inside its template, so the
 * header and footer sit in the block tree alongside the page's own content.
 * `post-only` shows the content by itself, and the parts are then absent from
 * the tree entirely — not hidden in it.
 */
const TEMPLATE_LOCKED = 'template-locked';

/**
 * Post types that ARE a template. Their parts are already the content on
 * screen, so there is no template left to bring into view.
 */
const TEMPLATE_POST_TYPES = [ 'wp_template', 'wp_template_part' ];

/**
 * How long to wait for a part's own blocks to reach the tree after the mode flips.
 *
 * The agent's next move is to re-read the page structure, which is built from
 * the client context captured on that request — so returning before the parts
 * land hands it a structure that still shows none, which is the exact reading
 * that makes it refuse. Each part is fetched as its own entity, so the ceiling
 * covers a network round trip rather than a render.
 */
const TEMPLATE_PARTS_TIMEOUT_MS = 5000;

type RenderingModes = Record< string, Record< string, string > >;

export interface ShowTemplateIO {
	getRenderingMode: () => string | undefined;
	getCurrentPostType: () => string | undefined;
	getCurrentTemplateId: () => string | undefined;
	/** The active theme's stylesheet, or undefined while it has not resolved. */
	getStylesheet: () => string | undefined;
	getRenderingModes: () => RenderingModes | undefined;
	setRenderingMode: ( mode: string ) => void;
	setRenderingModes: ( modes: RenderingModes ) => void;
	/** Resolves true once a template part's blocks are in the tree, false on timeout. */
	waitForTemplateParts: () => Promise< boolean >;
}

// Agent-facing next step. Kept out of `message` (which is translated and may be
// surfaced to the user) so the model never receives it in the user's locale.
const RE_READ_STRUCTURE =
	'Call big_sky__get_page_structure again and read templateParts fresh before editing.';

function errorResult( message: string, error: string ): AbilityResult {
	return {
		result: { success: false, message, error },
		returnToAgent: true,
	};
}

/**
 * Persist the choice the way core's own "Show template" control does, by
 * writing the `core.renderingModes` preference for this theme and post type.
 *
 * Reimplemented rather than called: core exposes this only as the private
 * `setDefaultRenderingMode` action, and every input it reads is public. One
 * deliberate difference — core rebuilds the preference as `{ [theme]: ... }`
 * and so discards every other theme's entry; this merges and keeps them.
 *
 * Skipped when the stylesheet has not resolved, since the preference is keyed
 * by theme and there is nothing to key it under. The mode is still set, so the
 * ability degrades to session-only rather than failing.
 */
function persistRenderingMode( io: ShowTemplateIO, postType: string ): boolean {
	const theme = io.getStylesheet();

	if ( ! theme ) {
		return false;
	}

	const modes = io.getRenderingModes() ?? {};

	io.setRenderingModes( {
		...modes,
		[ theme ]: { ...modes[ theme ], [ postType ]: TEMPLATE_LOCKED },
	} );

	return true;
}

/**
 * Bring the page's template into view, so the site header and footer become
 * part of the content the editor — and therefore the agent — can see.
 * @param io Editor accessors, injected so the branch table stays testable
 *           without a WordPress runtime.
 */
export async function showTemplate( io: ShowTemplateIO ): Promise< AbilityResult > {
	const postType = io.getCurrentPostType();

	if ( postType && TEMPLATE_POST_TYPES.includes( postType ) ) {
		return errorResult(
			__( 'That is already open in the editor.', __i18n_text_domain__ ),
			`The editor is open on a ${ postType }, so its parts are already the content in view. ${ RE_READ_STRUCTURE }`
		);
	}

	/*
	 * Checked before anything is written, and that ordering is load-bearing.
	 * Big Sky's easy mode forces this mode on the editor store while
	 * deliberately never writing `core.renderingModes` — a `core`-scope
	 * preference follows the user into every other editor and outlives the
	 * session. Short-circuiting here means an agent call made inside easy mode
	 * cannot breach that.
	 */
	if ( io.getRenderingMode() === TEMPLATE_LOCKED ) {
		return {
			result: {
				success: true,
				message: __( 'The template is already showing.', __i18n_text_domain__ ),
				details: {
					renderingMode: TEMPLATE_LOCKED,
					changed: false,
					nextStep: RE_READ_STRUCTURE,
				},
			},
			returnToAgent: true,
		};
	}

	if ( ! io.getCurrentTemplateId() ) {
		return errorResult(
			__( 'This page has no template to show.', __i18n_text_domain__ ),
			'The open page has no template, so there is no header or footer to bring into view from here.'
		);
	}

	io.setRenderingMode( TEMPLATE_LOCKED );

	const persisted = postType ? persistRenderingMode( io, postType ) : false;
	const hasParts = await io.waitForTemplateParts();

	return {
		result: {
			success: true,
			message: __(
				'I turned on the template, so the header and footer are now part of the page.',
				__i18n_text_domain__
			),
			details: {
				renderingMode: TEMPLATE_LOCKED,
				changed: true,
				persisted,
				templatePartsInView: hasParts,
				nextStep: hasParts
					? RE_READ_STRUCTURE
					: `The template is showing but no template part has reached the editor yet. ${ RE_READ_STRUCTURE }`,
			},
		},
		returnToAgent: true,
	};
}

/*
 * The editor, preferences and block-editor stores are reached by name rather
 * than by store descriptor, so this ability adds no `@wordpress/*` dependency
 * to the package. A dependency change rewrites the `.asset.json` files, which
 * Jetpack fetches from production rather than a sandbox — so it would not take
 * effect on Atomic until a deploy. `show-component/callback.ts` reads
 * `core/editor` the same way. Every store here is registered by the editor
 * itself, and the callback only runs on editor pages.
 */
type EditorSelectors = {
	getRenderingMode?: () => string | undefined;
	getCurrentPostType?: () => string | undefined;
	getCurrentTemplateId?: () => string | undefined;
};

type EditorActions = {
	setRenderingMode?: ( mode: string ) => void;
};

type PreferencesSelectors = {
	get?: ( scope: string, name: string ) => unknown;
};

type PreferencesActions = {
	set?: ( scope: string, name: string, value: unknown ) => void;
};

type BlockEditorSelectors = {
	getBlocksByName?: ( name: string ) => string[];
	getBlocks?: ( rootClientId?: string ) => unknown[];
};

const editorSelect = () => select( 'core/editor' ) as EditorSelectors | undefined;
const editorDispatch = () => dispatch( 'core/editor' ) as EditorActions | undefined;
const preferencesSelect = () => select( 'core/preferences' ) as PreferencesSelectors | undefined;
const preferencesDispatch = () => dispatch( 'core/preferences' ) as PreferencesActions | undefined;
const blockEditorSelect = () => select( 'core/block-editor' ) as BlockEditorSelectors | undefined;

/*
 * A part counts as in view only once its own blocks have arrived, not when the
 * node for it appears. A template part holds no content of its own: the block
 * mounts first and fetches the `wp_template_part` entity behind it, so for a
 * beat it sits in the tree with nothing under it. The page structure the agent
 * reads is built from those children — a part with none contributes no header
 * or footer section at all — so returning on the node alone hands the agent a
 * structure that reports no part in view, which is the reading that makes it
 * refuse.
 */
function hasTemplateParts(): boolean {
	const blockEditor = blockEditorSelect();
	const parts = blockEditor?.getBlocksByName?.( 'core/template-part' ) ?? [];

	return parts.some( ( clientId ) => ( blockEditor?.getBlocks?.( clientId )?.length ?? 0 ) > 0 );
}

/**
 * Resolve once a template part's blocks are in the tree.
 *
 * Flipping the mode does not fill the tree synchronously — the editor has to
 * render the page inside its template first — so this waits for the result
 * rather than the dispatch.
 * @returns Whether a part's blocks arrived before the timeout.
 */
const waitForTemplateParts = (): Promise< boolean > =>
	waitForStore( 'core/block-editor', hasTemplateParts, TEMPLATE_PARTS_TIMEOUT_MS );

/**
 * The `show-template` ability callback.
 */
export async function showTemplateCallback(): Promise< AbilityResult > {
	// Mutating callbacks guard in place: registration is lazy and editor-only,
	// but ownership of the tool call is not, so the guard travels with the write.
	if ( ! isEditorPage() ) {
		return errorResult(
			__( 'I can only show the template from the editor.', __i18n_text_domain__ ),
			'The editor is not open, so there is no template to show.'
		);
	}

	const editor = editorSelect();

	if ( ! editor?.getRenderingMode ) {
		return errorResult(
			__( 'I could not reach the editor to show the template.', __i18n_text_domain__ ),
			'The core/editor store is unavailable, so the rendering mode cannot be read or set.'
		);
	}

	try {
		return await showTemplate( {
			getRenderingMode: () => editor.getRenderingMode?.(),
			getCurrentPostType: () => editor.getCurrentPostType?.(),
			getCurrentTemplateId: () => editor.getCurrentTemplateId?.(),
			getStylesheet: () =>
				(
					select( coreStore ) as unknown as {
						getCurrentTheme?: () => { stylesheet?: string } | undefined;
					}
				 ).getCurrentTheme?.()?.stylesheet,
			getRenderingModes: () =>
				preferencesSelect()?.get?.( 'core', 'renderingModes' ) as RenderingModes | undefined,
			setRenderingMode: ( mode ) => editorDispatch()?.setRenderingMode?.( mode ),
			setRenderingModes: ( modes ) =>
				preferencesDispatch()?.set?.( 'core', 'renderingModes', modes ),
			waitForTemplateParts,
		} );
	} catch ( error ) {
		// eslint-disable-next-line no-console
		console.error( '[AgentsManager] Error showing the template:', error );

		return errorResult(
			__( 'I could not show the template.', __i18n_text_domain__ ),
			error instanceof Error ? error.message : String( error )
		);
	}
}
