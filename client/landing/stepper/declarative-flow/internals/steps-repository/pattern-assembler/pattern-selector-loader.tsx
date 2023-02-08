import { useTranslate } from 'i18n-calypso';
import PatternSelector from './pattern-selector';
import { useHeaderPatterns, useFooterPatterns, useSectionPatterns } from './patterns-data';
import type { Pattern } from './types';

type PatternSelectorLoaderProps = {
	showPatternSelectorType: string | null;
	selectedPattern: Pattern | null;
	onSelect: ( selectedPattern: Pattern ) => void;
	onBack: () => void;
	onDoneClick: () => void;
};

const PatternSelectorLoader = ( {
	showPatternSelectorType,
	onSelect,
	onBack,
	onDoneClick,
	selectedPattern,
}: PatternSelectorLoaderProps ) => {
	const translate = useTranslate();
	const headerPatterns = useHeaderPatterns();
	const footerPatterns = useFooterPatterns();
	const sectionPatterns = useSectionPatterns();

	switch ( showPatternSelectorType ) {
		case 'header':
			return (
				<PatternSelector
					patterns={ headerPatterns }
					onSelect={ onSelect }
					onBack={ onBack }
					onDoneClick={ onDoneClick }
					title={ translate( 'Add a header' ) }
					selectedPattern={ selectedPattern }
				/>
			);
		case 'footer':
			return (
				<PatternSelector
					patterns={ footerPatterns }
					onSelect={ onSelect }
					onBack={ onBack }
					onDoneClick={ onDoneClick }
					title={ translate( 'Add a footer' ) }
					selectedPattern={ selectedPattern }
				/>
			);
		case 'section':
			return (
				<PatternSelector
					patterns={ sectionPatterns }
					onSelect={ onSelect }
					onBack={ onBack }
					onDoneClick={ onDoneClick }
					title={ selectedPattern ? translate( 'Replace section' ) : translate( 'Add sections' ) }
					selectedPattern={ selectedPattern }
				/>
			);
		default:
			return null;
	}
};

export default PatternSelectorLoader;
