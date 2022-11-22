import React from 'react';
import useQueryRenderedPatterns from '../hooks/use-query-rendered-patterns';
import PatternsRendererContext from './patterns-renderer-context';

interface Props {
	siteId: number;
	stylesheet: string;
	patternIds: string[];
	children: JSX.Element;
}

const PatternsRendererProvider = ( { siteId, stylesheet, patternIds, children }: Props ) => {
	const { data: renderedPatterns } = useQueryRenderedPatterns( siteId, stylesheet, patternIds );

	if ( ! renderedPatterns ) {
		return null;
	}

	return (
		<PatternsRendererContext.Provider value={ renderedPatterns }>
			{ children }
		</PatternsRendererContext.Provider>
	);
};

export default PatternsRendererProvider;
