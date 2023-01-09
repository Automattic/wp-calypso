import React, { useEffect, useMemo } from 'react';
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
	const { data, isLoading, hasNextPage, fetchNextPage } = useRenderedPatterns(
		siteId,
		stylesheet,
		patternIds,
		siteInfo
	);

	const renderedPatterns = useMemo(
		() =>
			data?.pages
				? data.pages.reduce( ( previous, current ) => ( { ...previous, ...current } ), {} )
				: {},
		[ data?.pages?.length ]
	);

	useEffect( () => {
		if ( ! isLoading && hasNextPage ) {
			fetchNextPage();
		}
	}, [ isLoading, hasNextPage, fetchNextPage ] );

	return (
		<PatternsRendererContext.Provider value={ renderedPatterns }>
			{ children }
		</PatternsRendererContext.Provider>
	);
};

export default PatternsRendererProvider;
