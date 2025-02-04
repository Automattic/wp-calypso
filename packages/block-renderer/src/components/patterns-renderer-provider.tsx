import React, { useMemo, PropsWithChildren } from 'react';
import useRenderedPatterns from '../hooks/use-rendered-patterns';
import PatternsRendererContext from './patterns-renderer-context';
import type { SiteInfo } from '../types';

interface Props {
	siteId: number | string;
	stylesheet?: string;
	patternIdsByCategory: Record< string, string[] >;
	siteInfo?: SiteInfo;
	shouldShufflePosts: boolean;
}

const PatternsRendererProvider = ( {
	siteId,
	stylesheet = '',
	patternIdsByCategory,
	children,
	siteInfo = {},
	shouldShufflePosts,
}: PropsWithChildren< Props > ) => {
	const renderedPatterns = useRenderedPatterns(
		siteId,
		stylesheet,
		patternIdsByCategory,
		siteInfo
	);

	const contextValue = useMemo(
		() => ( {
			renderedPatterns,
			shouldShufflePosts,
		} ),
		[ renderedPatterns, shouldShufflePosts ]
	);

	return (
		<PatternsRendererContext.Provider value={ contextValue }>
			{ children }
		</PatternsRendererContext.Provider>
	);
};

export default PatternsRendererProvider;
