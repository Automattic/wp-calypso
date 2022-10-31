import { useTranslate } from 'i18n-calypso';
import PatternSelector from './pattern-selector';
import { headerPatterns, footerPatterns, sectionPatterns } from './patterns-data';
import type { Pattern } from './types';

type PatternSelectorLoaderProps = {
	onSelect: ( selectedPattern: Pattern | null ) => void;
	onBack: () => void;
	showPatternSelectorType: string | null;
};

const PatternSelectorLoader = ( {
	showPatternSelectorType,
	onSelect,
	onBack,
}: PatternSelectorLoaderProps ) => {
	const translate = useTranslate();

	return (
		<>
			<PatternSelector
				show={ showPatternSelectorType === 'header' }
				patterns={ headerPatterns }
				onSelect={ onSelect }
				onBack={ onBack }
				title={ translate( 'Choose a header' ) }
			/>
			<PatternSelector
				show={ showPatternSelectorType === 'footer' }
				patterns={ footerPatterns }
				onSelect={ onSelect }
				onBack={ onBack }
				title={ translate( 'Choose a footer' ) }
			/>
			<PatternSelector
				show={ showPatternSelectorType === 'section' }
				patterns={ sectionPatterns }
				onSelect={ onSelect }
				onBack={ onBack }
				title={ translate( 'Add a section' ) }
			/>
		</>
	);
};

export default PatternSelectorLoader;
