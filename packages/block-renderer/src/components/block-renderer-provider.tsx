import { store as blockEditorStore } from '@wordpress/block-editor';
import { useDispatch } from '@wordpress/data';
import { useEffect } from 'react';
import useBlockRendererSettings from '../hooks/use-block-renderer-settings';
import { PreloadStyleAssets } from './preload-assets';

export interface Props {
	siteId: number | string;
	stylesheet?: string;
	children: JSX.Element;
}

const BlockRendererProvider = ( { siteId, stylesheet = '', children }: Props ) => {
	const { data: settings } = useBlockRendererSettings( siteId, stylesheet );

	// @ts-expect-error Type definition is outdated
	const { updateSettings } = useDispatch( blockEditorStore );

	useEffect( () => {
		if ( settings ) {
			updateSettings( settings );
		}
	}, [ settings ] );

	if ( ! settings ) {
		return null;
	}

	return (
		<>
			<PreloadStyleAssets html={ settings?.__unstableResolvedAssets?.styles } />
			{ children }
		</>
	);
};

export default BlockRendererProvider;
