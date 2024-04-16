import { createContext, useContext } from 'react';
import { PatternTypeFilter } from 'calypso/my-sites/patterns/types';

type PatternsContextProps = {
	searchTerm: string;
	category: string;
	isGridView: boolean;
	patternPermalinkId?: number;
	patternTypeFilter?: PatternTypeFilter;
	referrer?: string;
};

export const PatternsContext = createContext< PatternsContextProps >( {
	searchTerm: undefined,
	category: undefined,
	isGridView: false,
	patternPermalinkId: undefined,
	patternTypeFilter: undefined,
	referrer: undefined,
} );

export const usePatternsContext = () => useContext( PatternsContext );
