import { store as blockEditorStore } from '@wordpress/block-editor';
import { store as coreStore } from '@wordpress/core-data';
import { useSelect, useDispatch } from '@wordpress/data';
import { store as editorStore } from '@wordpress/editor';
// import { store as editSiteStore } from '@wordpress/edit-site/src/store';
import { omit, unionBy } from 'lodash';
import { useEffect } from 'react';
import useQueryBlockSettings from './use-query-block-settings';

export interface Props {
	siteId: number;
}

const useInitializeBlockSettings = ( siteId: number ) => {
	const { data: blockSettings } = useQueryBlockSettings( siteId );

	const { restBlockPatterns, restBlockPatternCategories } = useSelect(
		( select ) => ( {
			restBlockPatterns: select( coreStore ).getBlockPatterns(),
			restBlockPatternCategories: select( coreStore ).getBlockPatternCategories(),
		} ),
		[]
	);

	const { updateSettings } = useDispatch( blockEditorStore );
	const { updateEditorSettings } = useDispatch( editorStore );

	useEffect( () => {
		if ( ! ( blockSettings && restBlockPatterns && restBlockPatternCategories ) ) {
			return;
		}

		const settingsBlockPatterns =
			blockSettings.__experimentalAdditionalBlockPatterns ?? // WP 6.0
			blockSettings.__experimentalBlockPatterns; // WP 5.9

		const settingsBlockPatternCategories =
			blockSettings.__experimentalAdditionalBlockPatternCategories ?? // WP 6.0
			blockSettings.__experimentalBlockPatternCategories; // WP 5.9

		const settings = {
			...omit( blockSettings, [
				'__experimentalAdditionalBlockPatterns',
				'__experimentalAdditionalBlockPatternCategories',
			] ),
			__experimentalBlockPatterns: unionBy( settingsBlockPatterns, restBlockPatterns, 'name' ),
			__experimentalBlockPatternCategories: unionBy(
				settingsBlockPatternCategories,
				restBlockPatternCategories,
				'name'
			),
		};

		updateSettings( settings );

		updateEditorSettings( {
			defaultTemplateTypes: settings.defaultTemplateTypes,
			defaultTemplatePartAreas: settings.defaultTemplatePartAreas,
		} );
	}, [ blockSettings, restBlockPatterns, restBlockPatternCategories ] );
};

export default useInitializeBlockSettings;
