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
	categories,
	patternsMapByCategory,
}: PatternListPanelProps ) => {
	const categoryPatterns = selectedCategory ? patternsMapByCategory[ selectedCategory ] : [];

	if ( ! selectedCategory ) {
		return null;
	}

	const category = categories.find( ( { name } ) => name === selectedCategory );
	return (
		<div key="pattern-list-panel" className="pattern-list-panel__wrapper">
			<div className="pattern-list-panel__title">{ category?.label }</div>
			<p className="pattern-list-panel__description">{ category?.description }</p>
			<PatternSelector
				patterns={ categoryPatterns }
				onSelect={ onSelect }
				selectedPattern={ selectedPattern }
			/>
		</div>
	);
};

export default PatternListPanel;
