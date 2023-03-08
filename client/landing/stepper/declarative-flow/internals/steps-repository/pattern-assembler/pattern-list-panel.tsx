import AnimateMotion from './animate-motion';
import useSectionPatternsMapByCategory from './hooks/use-patterns-map-by-category';
import PatternSelector from './pattern-selector';
import type { Pattern, Category } from './types';
import './pattern-list-panel.scss';

type PatternListPanelProps = {
	onSelect: ( selectedPattern: Pattern | null ) => void;
	patterns: Pattern[];
	selectedPattern: Pattern | null;
	categories: Category[];
	categorySelected: string | null;
	openPatternList: boolean | null;
	onDoneClick?: () => void;
};

const PatternListPanel = ( {
	onSelect,
	patterns,
	selectedPattern,
	categories,
	categorySelected,
	openPatternList,
}: PatternListPanelProps ) => {
	const sectionPatternsMapByCategory = useSectionPatternsMapByCategory( patterns, categories );
	const categoryPatterns = categorySelected ? sectionPatternsMapByCategory[ categorySelected ] : [];

	return (
		<AnimateMotion featureName="domAnimation">
			{ ( m: any ) =>
				openPatternList ? (
					<m.div
						key="pattern-list-panel"
						className="pattern-list-panel__wrapper"
						layoutScroll
						initial={ { opacity: 0, transform: 'translateX(0)' } }
						animate={ { opacity: 1, transform: 'translateX(345px)' } }
						transition={ {
							type: 'spring',
							stiffness: 150,
							damping: 20,
							mass: 0.75,
							duration: 0.45,
						} }
						exit={ { opacity: 0 } }
					>
						<PatternSelector
							patterns={ categoryPatterns }
							onSelect={ onSelect }
							selectedPattern={ selectedPattern }
						/>
					</m.div>
				) : null
			}
		</AnimateMotion>
	);
};

export default PatternListPanel;
