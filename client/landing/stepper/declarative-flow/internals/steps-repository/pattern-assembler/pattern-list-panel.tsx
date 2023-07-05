import { useMemo } from 'react';
import PatternSelector from './pattern-selector';
import type { Pattern, Category } from './types';
import './pattern-list-panel.scss';

type PatternListPanelProps = {
	onSelect: ( selectedPattern: Pattern | null ) => void;
	selectedPattern: Pattern | null;
	categories: Category[];
	selectedCategory: string | null;
	patternsMapByCategory: { [ key: string ]: Pattern[] };
	selectedPatterns?: Pattern[];
	label?: string;
	description?: string;
};

const PatternListPanel = ( {
	onSelect,
	selectedPattern,
	selectedPatterns,
	selectedCategory,
	categories,
	patternsMapByCategory,
	label,
	description,
}: PatternListPanelProps ) => {
	const categoryPatterns = selectedCategory ? patternsMapByCategory[ selectedCategory ] : [];

	const category = useMemo(
		() => selectedCategory && categories.find( ( { name } ) => name === selectedCategory ),
		[ categories, selectedCategory ]
	);

	if ( ! category ) {
		return null;
	}

	return (
		<div key="pattern-list-panel" className="pattern-list-panel__wrapper">
			<div className="pattern-list-panel__title">{ label ?? category?.label }</div>
			<div className="pattern-list-panel__description">
				{ description ?? category?.description }
			</div>
			<PatternSelector
				patterns={ categoryPatterns }
				onSelect={ onSelect }
				selectedPattern={ selectedPattern }
				selectedPatterns={ selectedPatterns }
			/>
		</div>
	);
};

export default PatternListPanel;
