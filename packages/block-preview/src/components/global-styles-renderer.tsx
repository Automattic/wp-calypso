import { store as blockEditorStore } from '@wordpress/block-editor';
import { useSelect, useDispatch } from '@wordpress/data';
import { useGlobalStylesOutput } from '@wordpress/edit-site/build-module/components/global-styles';
import { useEffect } from 'react';

const useGlobalStylesRenderer = () => {
	const [ styles, settings, svgFilters ] = useGlobalStylesOutput();
	const { getSettings } = useSelect( blockEditorStore );
	const { updateSettings } = useDispatch( blockEditorStore );

	useEffect( () => {
		if ( ! styles || ! settings ) {
			return;
		}

		const currentStoreSettings = getSettings();
		const nonGlobalStyles = currentStoreSettings.styles.filter(
			( style ) => ! style.isGlobalStyles
		);

		updateSettings( {
			...currentStoreSettings,
			styles: [ ...nonGlobalStyles, ...styles ],
			svgFilters,
			__experimentalFeatures: settings,
		} );
	}, [ styles, settings ] );
};

const GlobalStylesRenderer = () => {
	useGlobalStylesRenderer();

	return null;
};

export default GlobalStylesRenderer;
