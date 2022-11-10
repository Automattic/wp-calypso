import { store as blockEditorStore } from '@wordpress/block-editor';
import { useDispatch } from '@wordpress/data';
import { useEffect } from 'react';
import useQueryBlockSettings from './use-query-block-settings';

export interface Props {
	siteId: number;
}

const useInitializeBlockSettings = ( siteId: number ) => {
	const { data: blockSettings } = useQueryBlockSettings( siteId );

	// @ts-expect-error Type definition is outdated
	const { updateSettings } = useDispatch( blockEditorStore );

	useEffect( () => {
		if ( ! blockSettings ) {
			return;
		}

		updateSettings( blockSettings );
	}, [ blockSettings ] );
};

export default useInitializeBlockSettings;
