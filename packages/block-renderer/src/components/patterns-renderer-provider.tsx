import React from 'react';
import useRenderedPatterns from '../hooks/use-rendered-patterns';
import PatternsRendererContext from './patterns-renderer-context';
import type { SiteInfo } from '../types';

interface Props {
	siteId: number | string;
	stylesheet?: string;
	patternIds: string[];
	children: JSX.Element;
	siteInfo: SiteInfo;
}

const PatternsRendererProvider = ( {
	siteId,
	stylesheet = '',
	patternIds,
	children,
	siteInfo = {},
}: Props ) => {
	const renderedPatterns = useRenderedPatterns( siteId, stylesheet, patternIds, siteInfo );

	return (
		<PatternsRendererContext.Provider value={ renderedPatterns }>
			{ children }
		</PatternsRendererContext.Provider>
	);
};

export default PatternsRendererProvider;
