import { store as coreStore } from '@wordpress/core-data';
import { dispatch, select } from '@wordpress/data';

/** The site's `site_logo` setting: an attachment id, or `null` when unset. */
export type SiteLogo = number | string | null;

interface SiteRecord {
	site_logo?: SiteLogo;
}

interface CoreSelect {
	// An unresolved record reads as `false`, not `undefined`.
	getEditedEntityRecord: (
		kind: string,
		name: string,
		id?: string
	) => SiteRecord | false | undefined;
}

interface CoreDispatch {
	editEntityRecord: (
		kind: string,
		name: string,
		id: string | undefined,
		edits: Record< string, unknown >,
		options: { undoIgnore: boolean }
	) => void;
}

/**
 * The logo the editor currently has, or `undefined` where the site record is
 * unreadable. An unset logo reads as `null` — the value the site logo block
 * itself writes to clear one — so a restore can clear it again.
 */
export function getSiteLogo(): SiteLogo | undefined {
	const site = ( select( coreStore ) as CoreSelect | undefined )?.getEditedEntityRecord(
		'root',
		'site'
	);

	return site ? site.site_logo ?? null : undefined;
}

/**
 * Points the site at a logo. Agent edits stay out of the editor's undo stack —
 * `restore-checkpoint` is the undo the agent offers.
 */
export function setSiteLogo( logo: SiteLogo ): void {
	const coreDispatch = dispatch( coreStore ) as CoreDispatch | undefined;
	if ( ! coreDispatch ) {
		throw new Error( 'The site record is unavailable to edit.' );
	}

	coreDispatch.editEntityRecord(
		'root',
		'site',
		undefined,
		{ site_logo: logo },
		{
			undoIgnore: true,
		}
	);
}

// Resolved by name to keep `@wordpress/block-editor` out of the abilities chunk.
const BLOCK_EDITOR_STORE = 'core/block-editor';

interface BlockEditorSelect {
	getGlobalBlockCount: ( blockName?: string ) => number;
}

/**
 * Whether the open view renders a Site Logo block (template parts included),
 * or `undefined` where the block editor store is unreadable. The `site_logo`
 * setting is only visible where such a block displays it.
 */
export function hasSiteLogoBlock(): boolean | undefined {
	const count = (
		select( BLOCK_EDITOR_STORE ) as unknown as BlockEditorSelect | undefined
	 )?.getGlobalBlockCount( 'core/site-logo' );

	return count === undefined ? undefined : count > 0;
}
