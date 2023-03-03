import { Button } from '@automattic/components';
import { __experimentalNavigatorBackButton as NavigatorBackButton } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import NavigatorHeader from './navigator-header';
import PatternSelector from './pattern-selector';
import { useFooterPatterns } from './patterns-data';
import type { Pattern } from './types';

interface Props {
	selectedPattern: Pattern | null;
	onSelect: ( selectedPattern: Pattern | null ) => void;
	onDoneClick: () => void;
}

const ScreenFooter = ( { selectedPattern, onSelect, onDoneClick }: Props ) => {
	const translate = useTranslate();
	const patterns = useFooterPatterns();

	return (
		<>
			<NavigatorHeader
				title={ translate( 'Choose a footer' ) }
				description={ translate(
					'Your footer will be added to all pages and can be used to show information or links that will help visitors take the next step.'
				) }
			/>
			<div className="screen-container__body">
				<PatternSelector
					patterns={ patterns }
					onSelect={ onSelect }
					selectedPattern={ selectedPattern }
					emptyPatternText={ translate( 'No Footer' ) }
				/>
			</div>
			<div className="screen-container__footer">
				<NavigatorBackButton
					as={ Button }
					className="pattern-assembler__button"
					onClick={ onDoneClick }
					primary
				>
					{ translate( 'Done' ) }
				</NavigatorBackButton>
			</div>
		</>
	);
};

export default ScreenFooter;
