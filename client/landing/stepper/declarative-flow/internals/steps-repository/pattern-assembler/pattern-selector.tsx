import { useAsyncList } from '@wordpress/compose';
import PatternListRenderer from './pattern-list-renderer';
import type { Pattern } from './types';

type PatternSelectorProps = {
	patterns: Pattern[];
	onSelect: ( selectedPattern: Pattern | null ) => void;
	selectedPattern: Pattern | null;
	emptyPatternText?: string;
};

const PatternSelector = ( {
	patterns,
	onSelect,
	selectedPattern,
	emptyPatternText,
}: PatternSelectorProps ) => {
	const shownPatterns = useAsyncList( patterns );

	return (
		<div className="pattern-selector">
			<div className="pattern-selector__body">
				<div className="pattern-selector__block-list" role="listbox">
					<PatternListRenderer
						patterns={ patterns }
						shownPatterns={ shownPatterns }
						selectedPattern={ selectedPattern }
						emptyPatternText={ emptyPatternText }
						activeClassName="pattern-selector__block-list--selected-pattern"
						onSelect={ onSelect }
					/>
				</div>
			</div>
		</div>
	);
};

export default PatternSelector;
