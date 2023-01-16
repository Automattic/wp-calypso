import { useTranslate } from 'i18n-calypso';
import NavigatorHeader from './navigator-header';
import PatternSelector from './pattern-selector';
import { useHeaderPatterns } from './patterns-data';
import type { Pattern } from './types';

interface Props {
	selectedPattern: Pattern | null;
	onSelect: ( selectedPattern: Pattern ) => void;
	onDoneClick: () => void;
}

const ScreenHeader = ( { selectedPattern, onSelect, onDoneClick }: Props ) => {
	const translate = useTranslate();
	const patterns = useHeaderPatterns();

	return (
		<>
			<NavigatorHeader
				title={ translate( 'Choose a header' ) }
				description={ translate(
					'Your header will be added to all pages and is usually where your site navigation lives.'
				) }
			/>
			<div className="screen-container__body">
				<PatternSelector
					patterns={ patterns }
					onSelect={ onSelect }
					onDoneClick={ onDoneClick }
					selectedPattern={ selectedPattern }
					emptyPatternText={ translate( 'No Header' ) }
				/>
			</div>
		</>
	);
};

export default ScreenHeader;
