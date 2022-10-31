import { useTranslate } from 'i18n-calypso';
import Delayed from './delayed-render-hook';
import PatternSelector from './pattern-selector';
import { headerPatterns, footerPatterns, sectionPatterns } from './patterns-data';
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

	return (
		<>
			<PatternSelector
				show={ showPatternSelectorType === 'header' }
				patterns={ headerPatterns }
				onSelect={ onSelect }
				onBack={ onBack }
				title={ translate( 'Choose a header' ) }
				selectedPattern={ selectedPattern }
			/>
			<Delayed>
				<PatternSelector
					show={ showPatternSelectorType === 'footer' }
					patterns={ footerPatterns }
					onSelect={ onSelect }
					onBack={ onBack }
					title={ translate( 'Choose a footer' ) }
					selectedPattern={ selectedPattern }
				/>
			</Delayed>
			<Delayed>
				<PatternSelector
					show={ showPatternSelectorType === 'section' }
					patterns={ sectionPatterns }
					onSelect={ onSelect }
					onBack={ onBack }
					title={ translate( 'Add a section' ) }
					selectedPattern={ selectedPattern }
				/>
			</Delayed>
		</>
	);
};

export default PatternSelectorLoader;
