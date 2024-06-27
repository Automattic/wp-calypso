import {
	useSafeGlobalStylesOutput,
	withExperimentalBlockEditorProvider,
} from '@automattic/global-styles';
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
	const [ globalStyles ] = useSafeGlobalStylesOutput();

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
