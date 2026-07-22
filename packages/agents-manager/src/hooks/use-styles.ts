import { store as coreStore } from '@wordpress/core-data';
import { useDispatch } from '@wordpress/data';
import { useCallback } from '@wordpress/element';
import mergeGlobalStyles from '../utils/merge-global-styles';
import useGlobalStyles from './use-global-styles';
import type { StyleVariation } from '../components/styles-preview';

/**
 * Merges a style variation (color, font, or button) into the editor's global styles.
 * Returns whether the variation was applied.
 */
export default function useStyles() {
	const { globalStylesId, globalStyles: currentRecord } = useGlobalStyles();

	const { editEntityRecord } = useDispatch( coreStore );

	return useCallback(
		( variation: StyleVariation ): boolean => {
			if ( ! globalStylesId || ! currentRecord ) {
				return false;
			}

			const merged = {
				settings: variation.settings
					? mergeGlobalStyles( currentRecord.settings || {}, variation.settings )
					: currentRecord.settings,
				styles: variation.styles
					? mergeGlobalStyles( currentRecord.styles || {}, variation.styles )
					: currentRecord.styles,
			};

			editEntityRecord( 'root', 'globalStyles', globalStylesId, merged );

			return true;
		},
		[ globalStylesId, currentRecord, editEntityRecord ]
	);
}
