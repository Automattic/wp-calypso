import React from 'react';
import useQueryRenderedPatterns from '../hooks/use-query-rendered-patterns';
import PatternRendererContext from './pattern-renderer-context';

interface Props {
	siteId: number;
	stylesheet: string;
	patternIds: string[];
	children: JSX.Element;
}

const PatternRendererProvider = ( { siteId, stylesheet, patternIds, children }: Props ) => {
	const { data: renderedPatterns } = useQueryRenderedPatterns( siteId, stylesheet, patternIds );

	if ( ! renderedPatterns ) {
		return null;
	}

	return (
		<PatternRendererContext.Provider value={ renderedPatterns }>
			{ children }
		</PatternRendererContext.Provider>
	);
};

export default PatternRendererProvider;
