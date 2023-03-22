import PatternSelector from './pattern-selector';
import type { Pattern, Category } from './types';
import './pattern-list-panel.scss';

type PatternListPanelProps = {
	onSelect: ( selectedPattern: Pattern | null ) => void;
	patterns: Pattern[];
	selectedPattern: Pattern | null;
	categories: Category[];
	selectedCategory: string | null;
	sectionsMapByCategory: { [ key: string ]: Pattern[] };
};

const PatternListPanel = ( {
	onSelect,
	selectedPattern,
	selectedCategory,
	sectionsMapByCategory,
}: PatternListPanelProps ) => {
	const categoryPatterns = selectedCategory ? sectionsMapByCategory[ selectedCategory ] : [];

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
