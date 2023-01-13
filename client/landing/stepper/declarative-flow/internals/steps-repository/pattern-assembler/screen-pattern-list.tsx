import { useTranslate } from 'i18n-calypso';
import NavigatorHeader from './navigator-header';
import PatternSelector from './pattern-selector';
import { useSectionPatterns } from './patterns-data';
import type { Pattern } from './types';

interface Props {
	selectedPattern: Pattern | null;
	onSelect: ( selectedPattern: Pattern ) => void;
	onDoneClick: () => void;
}

const ScreenPatternList = ( { selectedPattern, onSelect, onDoneClick }: Props ) => {
	const translate = useTranslate();
	const patterns = useSectionPatterns();

	return (
		<>
			<NavigatorHeader
				title={ translate( 'Add patterns' ) }
				description={ translate(
					'Find the right patterns for you by exploring the list of categories below.'
				) }
			/>
			<div className="screen-container__body">
				<PatternSelector
					patterns={ patterns }
					onSelect={ onSelect }
					onDoneClick={ onDoneClick }
					selectedPattern={ selectedPattern }
				/>
			</div>
		</>
	);
};

export default ScreenPatternList;
