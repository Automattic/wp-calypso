import { useTranslate } from 'i18n-calypso';
import PatternSelector from './pattern-selector';
import { headerPatterns, footerPatterns, sectionPatterns } from './patterns-data';
import type { Pattern } from './types';

type PatternSelectorLoaderProps = {
	onSelect: ( selectedPattern: Pattern | null ) => void;
	pattern: Pattern | null;
	showPatternSelectorType: string | null;
};

const PatternSelectorLoader = ( {
	showPatternSelectorType,
	pattern,
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
				pattern={ pattern }
			/>
			<PatternSelector
				show={ showPatternSelectorType === 'footer' }
				patterns={ footerPatterns }
				onSelect={ onSelect }
				title={ translate( 'Choose a footer' ) }
				pattern={ pattern }
			/>
			<PatternSelector
				show={ showPatternSelectorType === 'section' }
				patterns={ sectionPatterns }
				onSelect={ onSelect }
				title={ translate( 'Choose a section' ) }
				pattern={ pattern }
			/>
		</>
	);
};

export default PatternSelectorLoader;
