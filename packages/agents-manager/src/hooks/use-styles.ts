import { store as coreStore } from '@wordpress/core-data';
import { useDispatch } from '@wordpress/data';
import { useCallback } from '@wordpress/element';
import deepmerge from 'deepmerge';
import { injectFontFamiliesIntoEditorIframe } from '../utils/font-families-to-css';
import useGlobalStyles from './use-global-styles';
import type { StyleVariation } from '../components/styles-preview';

interface StylesOptions {
	/** Inject `@font-face` CSS into the editor iframe after applying. */
	injectFonts?: boolean;
}

/**
 * Merges a style variation (color, font, or button) into the editor's global styles.
 * Optionally injects `@font-face` CSS into the editor iframe.
 */
export default function useStyles( options: StylesOptions = {} ) {
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

			if ( options.injectFonts ) {
				const families = variation.settings?.typography?.fontFamilies?.theme;
				if ( Array.isArray( families ) ) {
					injectFontFamiliesIntoEditorIframe( families );
				}
			}
		},
		[ globalStylesId, currentRecord, editEntityRecord, options.injectFonts ]
	);
}
