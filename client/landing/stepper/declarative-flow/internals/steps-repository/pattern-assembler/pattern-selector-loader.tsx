import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import PatternSelector from './pattern-selector';
import { HEADER_PATTERN_LIST, FOOTER_PATTERN_LIST, SECTION_PATTERN_LIST } from './patterns-data';
import useQueryPatterns from './use-query-patterns';
import type { Pattern } from './types';

type PatternSelectorLoaderProps = {
	onSelect: ( selectedPattern: Pattern | null ) => void;
	onBack: () => void;
	showPatternSelectorType: string | null;
	selectedPattern: Pattern | null;
};

const PatternSelectorLoader = ( {
	showPatternSelectorType,
	onSelect,
	onBack,
	selectedPattern,
}: PatternSelectorLoaderProps ) => {
	const translate = useTranslate();
	const { data: patterns } = useQueryPatterns();
	const { headerPatterns, footerPatterns, sectionPatterns } = useMemo( () => {
		const patternsById: { [ key: number ]: Pattern } = ( patterns || [] ).reduce(
			( acc, pattern ) => ( {
				...acc,
				[ pattern.ID ]: pattern,
			} ),
			{}
		);

		return {
			headerPatterns: HEADER_PATTERN_LIST.map( ( id ) => patternsById[ id ] ).filter( Boolean ),
			footerPatterns: FOOTER_PATTERN_LIST.map( ( id ) => patternsById[ id ] ).filter( Boolean ),
			sectionPatterns: SECTION_PATTERN_LIST.map( ( id ) => patternsById[ id ] ).filter( Boolean ),
		};
	}, [ patterns ] );

	if ( ! patterns ) {
		return null;
	}

	return (
		<>
			<PatternSelector
				show={ showPatternSelectorType === 'header' }
				patterns={ headerPatterns }
				onSelect={ onSelect }
				onBack={ onBack }
				title={ translate( 'Add a header' ) }
				selectedPattern={ selectedPattern }
			/>
			<PatternSelector
				show={ showPatternSelectorType === 'footer' }
				patterns={ footerPatterns }
				onSelect={ onSelect }
				onBack={ onBack }
				title={ translate( 'Add a footer' ) }
				selectedPattern={ selectedPattern }
			/>
			<PatternSelector
				show={ showPatternSelectorType === 'section' }
				patterns={ sectionPatterns }
				onSelect={ onSelect }
				onBack={ onBack }
				title={ translate( 'Add sections' ) }
				selectedPattern={ selectedPattern }
			/>
		</>
	);
};

export default PatternSelectorLoader;
