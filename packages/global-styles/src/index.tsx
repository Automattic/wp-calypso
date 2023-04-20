// Re-export useStyle from `@automattic/global-styles` to avoid calypso using `@wordpress/edit-site` directly
export { useStyle } from '@wordpress/edit-site/build-module/components/global-styles/hooks';
export * from './components';
export {
	DEFAULT_GLOBAL_STYLES_VARIATION_TITLE,
	DEFAULT_GLOBAL_STYLES_VARIATION_SLUG,
} from './constants';
export {
	useColorPaletteVariations,
	useFontPairingVariations,
	useSyncGlobalStylesUserConfig,
} from './hooks';

export * from './types';
