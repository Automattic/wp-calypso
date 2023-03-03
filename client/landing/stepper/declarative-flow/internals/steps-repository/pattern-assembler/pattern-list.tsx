import { isEnabled } from '@automattic/calypso-config';
import AnimateWithFeatures from './animate-with-features';
import useSectionPatternsMapByCategory from './hooks/use-sections-map-by-category';
import PatternSelector from './pattern-selector';
import type { Pattern, Category } from './types';
import './pattern-list.scss';

type PatternListProps = {
	onSelect: ( selectedPattern: Pattern | null ) => void;
	patterns: Pattern[];
	selectedPattern: Pattern | null;
	categories: Category[];
	categorySelected: string | null;
	openPatternList: boolean | null;
	onDoneClick?: () => void;
};

const PatternList = ( {
	onSelect,
	patterns,
	selectedPattern,
	categories,
	categorySelected,
	openPatternList,
	onDoneClick,
}: PatternListProps ) => {
	const sectionPatternsMapByCategory = useSectionPatternsMapByCategory( patterns, categories );
	const categoryPatterns = categorySelected ? sectionPatternsMapByCategory[ categorySelected ] : [];

	if ( ! isEnabled( 'pattern-assembler/categories' ) ) {
		return (
			<PatternSelector
				showHeader
				showDoneButton
				patterns={ patterns }
				selectedPattern={ selectedPattern }
				onDoneClick={ onDoneClick }
				onSelect={ onSelect }
			/>
		);
	}

	return (
		<AnimateWithFeatures featureName="domAnimation">
			{ ( m: any ) =>
				openPatternList ? (
					<m.div
						key="pattern-list"
						className="pattern-list__wrapper"
						layoutScroll
						initial={ { opacity: 0.2, left: 250 } }
						animate={ { opacity: 1, left: 343 } }
						transition={ {
							type: 'spring',
							stiffness: 150,
							damping: 20,
							mass: 0.75,
							duration: 0.25,
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
		</AnimateWithFeatures>
	);
};

export default PatternList;
