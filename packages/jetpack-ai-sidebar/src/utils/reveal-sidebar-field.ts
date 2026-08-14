/**
 * Reveals a post field in the block editor's document sidebar after the AI
 * changes it, so the user can see where the change landed.
 *
 * A field can be rendered more than one way — Jetpack replaces the core
 * excerpt panel with its own when the AI Assistant block is available, and
 * core itself renders the excerpt as a panel on older versions and as a
 * Summary row on newer ones. Each field lists its variants in order of
 * preference and the first one present wins.
 */

import { dispatch, select } from '@wordpress/data';

export interface SidebarTarget {
	/** Panel preference name, for variants the editor renders as a collapsible panel. */
	panelName?: string;
	/** Selector for the field, resolved within the document sidebar. */
	selector: string;
}

export const SIDEBAR_TARGETS: Record< string, SidebarTarget[] > = {
	excerpt: [
		{
			panelName: 'jetpack-ai-content-lens/ai-content-lens-plugin',
			selector: '.jetpack-ai-post-excerpt',
		},
		{ selector: '.editor-post-excerpt__dropdown' },
		{ panelName: 'post-excerpt', selector: '.editor-post-excerpt' },
	],
	seo: [ { panelName: 'jetpack-seo/jetpack-seo', selector: '.jetpack-seo-panel' } ],
};

const DOCUMENT_SIDEBAR = 'edit-post/document';
const DOCUMENT_SIDEBAR_ID = 'edit-post:document';
const DEFAULT_TIMEOUT_MS = 2000;

export interface RevealOptions {
	/** How long to wait for the field to render, in milliseconds. */
	timeout?: number;
}

function prefersReducedMotion(): boolean {
	return window.matchMedia?.( '(prefers-reduced-motion: reduce)' ).matches ?? false;
}

function nextFrame(): Promise< void > {
	return new Promise( ( resolve ) => requestAnimationFrame( () => resolve() ) );
}

interface FoundField {
	variant: SidebarTarget;
	field: HTMLElement;
}

/**
 * Looks for each variant once, in order of preference.
 * @param variants - Variants to look for, most preferred first.
 * @returns The first variant present, or null.
 */
function findField( variants: SidebarTarget[] ): FoundField | null {
	const sidebar = document.getElementById( DOCUMENT_SIDEBAR_ID );

	for ( const variant of variants ) {
		const field = sidebar?.querySelector< HTMLElement >( variant.selector );

		if ( field ) {
			return { variant, field };
		}
	}

	return null;
}

/**
 * Waits for whichever variant this editor renders. Variants are checked
 * together rather than in turn, so an editor using the last variant is no
 * slower than one using the first.
 * @param variants - Variants to look for, most preferred first.
 * @param timeout  - How long to wait, in milliseconds.
 * @returns The first variant found, or null.
 */
async function waitForField(
	variants: SidebarTarget[],
	timeout: number
): Promise< FoundField | null > {
	const deadline = performance.now() + timeout;
	let found = findField( variants );

	while ( ! found && performance.now() < deadline ) {
		await nextFrame();
		found = findField( variants );
	}

	return found;
}

function editorSelectors() {
	return select( 'core/editor' ) as unknown as {
		isEditorPanelOpened?: ( panelName: string ) => boolean;
		isEditorPanelRemoved?: ( panelName: string ) => boolean;
	};
}

/**
 * Whether a panel needs opening. Panels the editor has removed are skipped, so
 * a variant this editor cannot render costs no preference writes.
 * @param panelName - Panel preference name.
 * @returns Whether the panel should be opened.
 */
function needsOpening( panelName: string ): boolean {
	const { isEditorPanelOpened, isEditorPanelRemoved } = editorSelectors();

	return ! isEditorPanelRemoved?.( panelName ) && ! isEditorPanelOpened?.( panelName );
}

function togglePanel( panelName: string ): void {
	const editorDispatch = dispatch( 'core/editor' ) as unknown as {
		toggleEditorPanelOpened?: ( panelName: string ) => void;
	};

	editorDispatch?.toggleEditorPanelOpened?.( panelName );
}

/**
 * Reveals a field in the document sidebar.
 * @param fieldId         - Key of the target to reveal.
 * @param options         - Reveal options.
 * @param options.timeout - How long to wait for the field to render, in milliseconds.
 * @returns Whether the field was found and revealed.
 */
export async function revealSidebarField(
	fieldId: string,
	{ timeout = DEFAULT_TIMEOUT_MS }: RevealOptions = {}
): Promise< boolean > {
	const variants = SIDEBAR_TARGETS[ fieldId ];

	if ( ! variants?.length ) {
		return false;
	}

	const editorInterface = dispatch( 'core/interface' ) as unknown as {
		enableComplementaryArea?: ( scope: string, area: string ) => Promise< void >;
	};

	// The sidebar is the whole point, so there is nothing to reveal without it.
	if ( ! editorInterface?.enableComplementaryArea ) {
		return false;
	}

	// A selected block takes the sidebar slot over the document settings.
	(
		dispatch( 'core/block-editor' ) as unknown as { clearSelectedBlock?: () => void }
	 )?.clearSelectedBlock?.();

	await editorInterface.enableComplementaryArea( 'core', DOCUMENT_SIDEBAR );

	// A collapsed panel does not render its contents, so every candidate panel
	// has to be open before any of them can be found.
	const openedPanels = variants
		.map( ( variant ) => variant.panelName )
		.filter( ( panelName ): panelName is string => !! panelName && needsOpening( panelName ) );

	openedPanels.forEach( togglePanel );

	const found = await waitForField( variants, timeout );

	// Panels belonging to variants this editor does not render were opened only
	// to look inside them, so leave the user's preferences as they were.
	openedPanels
		.filter( ( panelName ) => panelName !== found?.variant.panelName )
		.forEach( togglePanel );

	if ( ! found ) {
		return false;
	}

	// Focus stays where the user put it — usually the chat input.
	found.field.scrollIntoView?.( {
		behavior: prefersReducedMotion() ? 'auto' : 'smooth',
		block: 'center',
	} );
	return true;
}
