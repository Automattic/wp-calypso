import {
	useSafeGlobalStylesOutputWithConfig,
	withExperimentalBlockEditorProvider,
	GlobalStylesContext,
} from '@automattic/global-styles';
import { useContext } from '@wordpress/element';
import { useMemo } from 'react';
import useBlockRendererSettings from '../hooks/use-block-renderer-settings';
import BlockRendererContext from './block-renderer-context';

export interface Props {
	siteId: number | string;
	stylesheet?: string;
	children: JSX.Element;
	useInlineStyles?: boolean;
	placeholder?: JSX.Element | null;
}

const useBlockRendererContext = (
	siteId: number | string,
	stylesheet: string,
	useInlineStyles = false
) => {
	const { data: settings } = useBlockRendererSettings( siteId, stylesheet, useInlineStyles );
	const { merged: config } = useContext( GlobalStylesContext );
	// Remove section style variations until we handle them
	if ( config?.styles?.blocks ) {
		delete config.styles.blocks.variations;
		delete config.styles.blocks[ 'core/group' ]?.variations;
		delete config.styles.blocks[ 'core/column' ]?.variations;
		delete config.styles.blocks[ 'core/columns' ]?.variations;
	}
	const [ globalStyles ] = useSafeGlobalStylesOutputWithConfig( config );

	const context = useMemo(
		() => ( {
			isReady: !! settings,
			settings: {
				...settings,
				styles: [
					...( settings?.styles || [] ),
					...( globalStyles || [] ),
					// Avoid scrollbars for previews.
					{
						css: 'body{height:auto;overflow:hidden;}',
						__unstableType: 'presets',
					},
					// Avoid unwanted editor styles
					{
						css: 'body{padding:0;}',
						__unstableType: 'presets',
					},
				],
			},
		} ),
		[ settings, globalStyles ]
	);

	return context;
};

const BlockRendererProvider = ( {
	siteId,
	stylesheet = '',
	children,
	useInlineStyles = false,
	placeholder = null,
}: Props ) => {
	const context = useBlockRendererContext( siteId, stylesheet, useInlineStyles );

	if ( ! context.isReady ) {
		return placeholder;
	}

	return (
		<BlockRendererContext.Provider value={ context }>{ children }</BlockRendererContext.Provider>
	);
};

export default withExperimentalBlockEditorProvider( BlockRendererProvider );
