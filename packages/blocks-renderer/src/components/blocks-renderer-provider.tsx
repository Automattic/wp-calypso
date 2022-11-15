import { store as blockEditorStore } from '@wordpress/block-editor';
import { useDispatch } from '@wordpress/data';
import { useEffect } from 'react';
import useQueryBlockSettings from '../hooks/use-query-block-settings';

export interface Props {
	siteId: number;
	stylesheet: string;
	children: JSX.Element;
}

const BlocksRendererProvider = ( { siteId, stylesheet, children }: Props ) => {
	const { data: blockSettings } = useQueryBlockSettings( siteId, stylesheet );

	// @ts-expect-error Type definition is outdated
	const { updateSettings } = useDispatch( blockEditorStore );

	useEffect( () => {
		if ( ! blockSettings ) {
			return;
		}

		updateSettings( blockSettings );
	}, [ blockSettings ] );

	if ( ! blockSettings ) {
		return null;
	}

	return children;
};

export default BlocksRendererProvider;
