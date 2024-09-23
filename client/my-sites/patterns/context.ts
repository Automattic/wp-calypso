import { createContext, useContext } from 'react';
import { PatternTypeFilter } from 'calypso/my-sites/patterns/types';

type PatternsContextProps = {
	searchTerm: string;
	category: string;
	isGridView: boolean;
	section: string | null;
	patternPermalinkId?: number;
	patternTypeFilter: PatternTypeFilter;
	referrer?: string;
};

export const PatternsContext = createContext< PatternsContextProps >( {
	searchTerm: '',
	category: '',
	isGridView: false,
	section: null,
	patternPermalinkId: undefined,
	patternTypeFilter: PatternTypeFilter.REGULAR,
	referrer: undefined,
} );

export const usePatternsContext = () => useContext( PatternsContext );
