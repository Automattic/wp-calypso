import { useMemo } from 'react';
import PatternSelector from './pattern-selector';
import type { Pattern, Category } from './types';
import './pattern-list-panel.scss';

export type PatternListPanelProps = {
	type: string;
	selectedPattern: Pattern | null;
	categories: Category[];
	selectedCategory: string | null;
	patternsMapByCategory: { [ key: string ]: Pattern[] };
	selectedPatterns?: Pattern[];
	title?: string;
	description?: string;
	onSelect: (
		type: string,
		selectedPattern: Pattern | null,
		selectedCategory: string | null
	) => void;
};

const PatternListPanel = ( {
	type,
	selectedPattern,
	selectedPatterns,
	selectedCategory,
	categories,
	patternsMapByCategory,
	title,
	description,
	onSelect,
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
			<div className="pattern-list-panel__title">{ title ?? category?.label }</div>
			<div className="pattern-list-panel__description">
				{ description ?? category?.description }
			</div>
			<PatternSelector
				patterns={ categoryPatterns }
				onSelect={ ( selectedPattern ) => onSelect( type, selectedPattern, selectedCategory ) }
				selectedPattern={ selectedPattern }
				selectedPatterns={ selectedPatterns }
			/>
		</div>
	);
};

export default PatternListPanel;
