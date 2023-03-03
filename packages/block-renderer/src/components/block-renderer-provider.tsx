import { useGlobalStylesOutput } from '@wordpress/edit-site/build-module/components/global-styles/use-global-styles-output';
import { useMemo } from 'react';
import useBlockRendererSettings from '../hooks/use-block-renderer-settings';
import BlockRendererContext from './block-renderer-context';

export interface Props {
	siteId: number | string;
	stylesheet?: string;
	children: JSX.Element;
	useInlineStyles?: boolean;
}

const useBlockRendererContext = (
	siteId: number | string,
	stylesheet: string,
	useInlineStyles = false
) => {
	const { data: settings } = useBlockRendererSettings( siteId, stylesheet, useInlineStyles );

	const [ globalStyles ] = useGlobalStylesOutput();

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
}: Props ) => {
	const context = useBlockRendererContext( siteId, stylesheet, useInlineStyles );

	if ( ! context.isReady ) {
		return null;
	}

	return (
		<BlockRendererContext.Provider value={ context }>{ children }</BlockRendererContext.Provider>
	);
};

export default BlockRendererProvider;
