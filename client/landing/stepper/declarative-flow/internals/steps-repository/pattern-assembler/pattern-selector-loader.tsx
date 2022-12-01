import { useTranslate } from 'i18n-calypso';
import PatternSelector from './pattern-selector';
import { headerPatterns, footerPatterns, sectionPatterns } from './patterns-data';
import type { Pattern } from './types';

type PatternSelectorLoaderProps = {
	showPatternSelectorType: string | null;
	selectedPattern: Pattern | null;
	onSelect: ( selectedPattern: Pattern ) => void;
	onBack: () => void;
};

const PatternSelectorLoader = ( {
	showPatternSelectorType,
	onSelect,
	onBack,
	selectedPattern,
}: PatternSelectorLoaderProps ) => {
	const translate = useTranslate();

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
				title={ selectedPattern ? translate( 'Add a section' ) : translate( 'Add sections' ) }
				selectedPattern={ selectedPattern }
			/>
		</>
	);
};

export default PatternSelectorLoader;
