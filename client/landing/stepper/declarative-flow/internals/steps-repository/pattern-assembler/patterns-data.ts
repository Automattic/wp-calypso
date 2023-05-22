import useCategoryAll from './hooks/use-category-all';
import useDotcomPatterns from './hooks/use-dotcom-patterns';

const useAllPatterns = ( lang: string | undefined ) => {
	const dotcomPatterns = useDotcomPatterns( lang );
	return useCategoryAll( dotcomPatterns );
};

export { useAllPatterns };
