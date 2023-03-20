import { isEnabled } from '@automattic/calypso-config';
import { Button } from '@automattic/components';
import { __experimentalNavigatorBackButton as NavigatorBackButton } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import NavigatorHeader from './navigator-header';
import PatternSelector from './pattern-selector';
import { useSectionPatterns } from './patterns-data';
import type { Pattern } from './types';

interface Props {
	selectedPattern: Pattern | null;
	onSelect: ( selectedPattern: Pattern | null ) => void;
	onBack: () => void;
	onDoneClick: () => void;
}

const ScreenPatternList = ( { selectedPattern, onSelect, onBack, onDoneClick }: Props ) => {
	const translate = useTranslate();
	const patterns = useSectionPatterns();
	const isSidebarRevampEnabled = isEnabled( 'pattern-assembler/sidebar-revamp' );

	return (
		<>
			{ isSidebarRevampEnabled && <NavigatorHeader title={ translate( 'Add patterns' ) } /> }
			<div className="screen-container__body">
				<PatternSelector
					title={ ! isSidebarRevampEnabled ? translate( 'Add sections' ) : undefined }
					patterns={ patterns }
					onSelect={ onSelect }
					onBack={ onBack }
					selectedPattern={ selectedPattern }
				/>
			</div>
			<div className="screen-container__footer">
				<NavigatorBackButton
					as={ Button }
					className="pattern-assembler__button"
					primary
					onClick={ onDoneClick }
				>
					{ translate( 'Save' ) }
				</NavigatorBackButton>
			</div>
		</>
	);
};

export default ScreenPatternList;
