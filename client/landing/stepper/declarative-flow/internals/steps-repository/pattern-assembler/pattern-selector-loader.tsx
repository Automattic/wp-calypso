import { useTranslate } from 'i18n-calypso';
import PatternSelector from './pattern-selector';
import { headerPatterns, footerPatterns, sectionPatterns } from './patterns-data';
import type { Pattern } from './types';

type PatternSelectorLoaderProps = {
	onSelect: ( selectedPattern: Pattern | null ) => void;
	showPatternSelectorType: string | null;
};

const PatternSelectorLoader = ( {
	showPatternSelectorType,
	onSelect,
}: PatternSelectorLoaderProps ) => {
	const translate = useTranslate();

	return (
		<>
			<PatternSelector
				show={ showPatternSelectorType === 'header' }
				patterns={ headerPatterns }
				onSelect={ onSelect }
				title={ translate( 'Choose a header' ) }
			/>
			<PatternSelector
				show={ showPatternSelectorType === 'footer' }
				patterns={ footerPatterns }
				onSelect={ onSelect }
				title={ translate( 'Choose a footer' ) }
			/>
			<PatternSelector
				show={ showPatternSelectorType === 'section' }
				patterns={ sectionPatterns }
				onSelect={ onSelect }
				title={ translate( 'Choose a section' ) }
			/>
		</>
	);
};

export default PatternSelectorLoader;
