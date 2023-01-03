import React, { useEffect, useMemo } from 'react';
import useRenderedPatterns from '../hooks/use-rendered-patterns';
import PatternsRendererContext from './patterns-renderer-context';

interface Props {
	siteId: number | string;
	stylesheet?: string;
	patternIds: string[];
	children: JSX.Element;
}

const PatternsRendererProvider = ( { siteId, stylesheet = '', patternIds, children }: Props ) => {
	const { data, isLoading, hasNextPage, fetchNextPage } = useRenderedPatterns(
		siteId,
		stylesheet,
		patternIds
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
