import useSectionPatternsMapByCategory from './hooks/use-patterns-map-by-category';
import PatternSelector from './pattern-selector';
import type { Pattern, Category } from './types';
import './pattern-list-panel.scss';

type PatternListPanelProps = {
	onSelect: ( selectedPattern: Pattern | null ) => void;
	patterns: Pattern[];
	selectedPattern: Pattern | null;
	categories: Category[];
	selectedCategory: string | null;
	onDoneClick?: () => void;
};

const PatternListPanel = ( {
	onSelect,
	patterns,
	selectedPattern,
	categories,
	selectedCategory,
}: PatternListPanelProps ) => {
	const sectionPatternsMapByCategory = useSectionPatternsMapByCategory( patterns, categories );
	const categoryPatterns = selectedCategory ? sectionPatternsMapByCategory[ selectedCategory ] : [];

	if ( ! selectedCategory ) {
		return null;
	}

	return (
		<div key="pattern-list-panel" className="pattern-list-panel__wrapper">
			<PatternSelector
				patterns={ categoryPatterns }
				onSelect={ onSelect }
				selectedPattern={ selectedPattern }
			/>
		</div>
	);
};

export default PatternListPanel;
