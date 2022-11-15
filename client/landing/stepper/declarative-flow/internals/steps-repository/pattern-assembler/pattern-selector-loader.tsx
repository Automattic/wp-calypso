import { useTranslate } from 'i18n-calypso';
import PatternSelector from './pattern-selector';
import { headerPatterns, footerPatterns, sectionPatterns } from './patterns-data';
import type { Pattern } from './types';

type PatternSelectorLoaderProps = {
	stylesheet?: string;
	onSelect: ( selectedPattern: Pattern | null ) => void;
	onBack: () => void;
	showPatternSelectorType: string | null;
	selectedPattern: Pattern | null;
};

const PatternSelectorLoader = ( {
	stylesheet,
	showPatternSelectorType,
	onSelect,
	onBack,
	selectedPattern,
}: PatternSelectorLoaderProps ) => {
	const translate = useTranslate();

	return (
		<>
			<PatternSelector
				stylesheet={ stylesheet }
				show={ showPatternSelectorType === 'header' }
				patternIds={ headerPatterns.map( ( pattern ) => pattern.id ) }
				onSelect={ onSelect }
				onBack={ onBack }
				title={ translate( 'Add a header' ) }
				selectedPattern={ selectedPattern }
			/>
			<PatternSelector
				stylesheet={ stylesheet }
				show={ showPatternSelectorType === 'footer' }
				patternIds={ footerPatterns.map( ( pattern ) => pattern.id ) }
				onSelect={ onSelect }
				onBack={ onBack }
				title={ translate( 'Add a footer' ) }
				selectedPattern={ selectedPattern }
			/>
			<PatternSelector
				stylesheet={ stylesheet }
				show={ showPatternSelectorType === 'section' }
				patternIds={ sectionPatterns.map( ( pattern ) => pattern.id ) }
				onSelect={ onSelect }
				onBack={ onBack }
				title={ translate( 'Add sections' ) }
				selectedPattern={ selectedPattern }
			/>
		</>
	);
};

export default PatternSelectorLoader;
