import PatternSelector from './pattern-selector';
import type { Pattern, Category } from './types';
import './pattern-list-panel.scss';

type PatternListPanelProps = {
	onSelect: ( selectedPattern: Pattern | null ) => void;
	selectedPattern: Pattern | null;
	categories: Category[];
	selectedCategory: string | null;
	patternsMapByCategory: { [ key: string ]: Pattern[] };
};

const PatternListPanel = ( {
	onSelect,
	selectedPattern,
	selectedCategory,
	patternsMapByCategory,
}: PatternListPanelProps ) => {
	const categoryPatterns = selectedCategory ? patternsMapByCategory[ selectedCategory ] : [];

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
