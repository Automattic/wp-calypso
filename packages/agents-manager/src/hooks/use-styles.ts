import { store as coreStore } from '@wordpress/core-data';
import { useDispatch } from '@wordpress/data';
import { useCallback } from '@wordpress/element';
import { isEditorPage } from '../utils/is-editor-page';
import mergeGlobalStyles from '../utils/merge-global-styles';
import resetButtonStyles, {
	mirrorButtonStylesToSubscriptionsBlock,
} from '../utils/reset-button-styles';
import resetTypographyStyles from '../utils/reset-typography-styles';
import useGlobalStyles from './use-global-styles';
import type { StyleVariation } from '../components/styles-preview';

export type StyleVariationType = 'color' | 'font' | 'button';

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

			return true;
		},
		[ globalStylesId, currentRecord, editEntityRecord ]
	);
}
