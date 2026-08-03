import { store as coreStore } from '@wordpress/core-data';
import { dispatch, useDispatch } from '@wordpress/data';
import { useCallback } from '@wordpress/element';
import { isEditorPage } from '../utils/is-editor-page';
import { findLegacyBlocksInStylesValue } from '../utils/legacy-style-variation-css';
import mergeGlobalStyles from '../utils/merge-global-styles';
import resetButtonStyles, {
	mirrorButtonStylesToSubscriptionsBlock,
} from '../utils/reset-button-styles';
import resetTypographyStyles from '../utils/reset-typography-styles';
import { recordBigSkyTracksEvent } from '../utils/tracks';
import useGlobalStyles from './use-global-styles';
import type { StyleVariation } from '../components/styles-preview';

export type StyleVariationType = 'color' | 'font' | 'button';

// The legacy block cannot appear mid-session — nothing writes it any more — so
// the common case scans once per session.
let hasCheckedLegacyCssThisSession = false;

// Scan the user's Additional CSS for legacy Easy Site Editor blocks, at most
// once per session. Detection is advisory and must never break an apply: a
// throw leaves the flag clear so the next apply retries.
function detectLegacyCss( cssValue: unknown ) {
	if ( hasCheckedLegacyCssThisSession ) {
		return [];
	}

	try {
		const blocks = findLegacyBlocksInStylesValue( cssValue );
		hasCheckedLegacyCssThisSession = true;
		return blocks;
	} catch {
		return [];
	}
}

// Test seam: the flag is module state.
export function resetLegacyCssSessionFlag() {
	hasCheckedLegacyCssThisSession = false;
}

/**
 * Merges a style variation (color, font, or button) into the editor's global styles.
 * Returns whether the variation was applied.
 */
export default function useStyles() {
	const { globalStylesId, globalStyles: currentRecord } = useGlobalStyles();

	const { editEntityRecord } = useDispatch( coreStore );

	return useCallback(
		( variation: StyleVariation, variationType?: StyleVariationType ): boolean => {
			// Off the editor (e.g. after SPA navigation with a live picker),
			// `editEntityRecord` would edit a record nothing ever saves —
			// report "not applied" instead.
			if ( ! isEditorPage() || ! globalStylesId || ! currentRecord ) {
				return false;
			}

			// Matching Big Sky's apply behavior: a button variation replaces the
			// whole button treatment (border/spacing reset + the outline color
			// stash/restore), and a font variation defines typography from
			// scratch instead of key-merging over the previous font.
			const base =
				variationType === 'font'
					? resetTypographyStyles( currentRecord )
					: {
							settings: currentRecord.settings,
							styles:
								variationType === 'button'
									? resetButtonStyles( currentRecord.styles || {}, variation )
									: currentRecord.styles,
					  };

			const merged = {
				// Big Sky never applies a button variation's `settings`.
				settings:
					variation.settings && variationType !== 'button'
						? mergeGlobalStyles( base.settings || {}, variation.settings )
						: base.settings,
				styles: variation.styles
					? mergeGlobalStyles( base.styles || {}, variation.styles )
					: base.styles,
			};

			if ( variationType === 'button' && merged.styles ) {
				merged.styles = mirrorButtonStylesToSubscriptionsBlock( merged.styles, variation );
			}

			editEntityRecord( 'root', 'globalStyles', globalStylesId, merged );

			// Font picks only: the legacy block pins typography with `!important`
			// and nothing else, so it can make a just-applied font pick look like
			// it did nothing — but cannot affect a color or button pick.
			if ( variationType === 'font' ) {
				const blocks = detectLegacyCss(
					( merged.styles as Record< string, unknown > | undefined )?.css
				);
				if ( blocks.length ) {
					recordBigSkyTracksEvent( 'legacy_css_found', { block_count: blocks.length } );
					// eslint-disable-next-line no-console
					console.warn(
						'[AgentsManager] Legacy Easy Site Editor CSS found — font picks may not be visible until it is removed.'
					);

					// TODO (ability-migration): Delete this dispatch once the removal
					// dialog ports with `set-styles`. Where Big Sky's app mounts, it
					// opens Big Sky's existing removal dialog — exactly as before AM
					// took over pick execution; elsewhere the store is unregistered
					// and this is a no-op.
					(
						dispatch( 'ai-assembler' ) as
							| { setLegacyCssBlocks?: ( legacyBlocks: typeof blocks ) => void }
							| undefined
					 )?.setLegacyCssBlocks?.( blocks );
				}
			}

			return true;
		},
		[ globalStylesId, currentRecord, editEntityRecord ]
	);
}
