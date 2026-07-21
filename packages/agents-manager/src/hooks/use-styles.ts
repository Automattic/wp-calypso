import { store as coreStore } from '@wordpress/core-data';
import { useDispatch } from '@wordpress/data';
import { useCallback } from '@wordpress/element';
import deepmerge from 'deepmerge';
import useGlobalStyles from './use-global-styles';
import type { StyleVariation } from '../components/styles-preview';

/**
 * Merges a style variation (color, font, or button) into the editor's global styles.
 */
export default function useStyles() {
	const { globalStylesId, globalStyles: currentRecord } = useGlobalStyles();

	const { editEntityRecord } = useDispatch( coreStore );

	return useCallback(
		( variation: StyleVariation ) => {
			if ( ! globalStylesId || ! currentRecord ) {
				return;
			}

			const arrayMerge = ( _: unknown[], src: unknown[] ) => src;

			const merged = {
				settings: variation.settings
					? deepmerge( currentRecord.settings || {}, variation.settings, { arrayMerge } )
					: currentRecord.settings,
				styles: variation.styles
					? deepmerge( currentRecord.styles || {}, variation.styles, { arrayMerge } )
					: currentRecord.styles,
			};

			editEntityRecord( 'root', 'globalStyles', globalStylesId, merged );
		},
		[ globalStylesId, currentRecord, editEntityRecord ]
	);
}
