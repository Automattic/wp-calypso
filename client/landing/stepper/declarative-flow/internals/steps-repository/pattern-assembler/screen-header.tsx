import { isEnabled } from '@automattic/calypso-config';
import { Button } from '@automattic/components';
import { __experimentalNavigatorBackButton as NavigatorBackButton } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import NavigatorHeader from './navigator-header';
import PatternSelector from './pattern-selector';
import { useHeaderPatterns } from './patterns-data';
import type { Pattern } from './types';

interface Props {
	selectedPattern: Pattern | null;
	onSelect: ( selectedPattern: Pattern | null ) => void;
	onBack: () => void;
	onDoneClick: () => void;
}

const ScreenHeader = ( { selectedPattern, onSelect, onBack, onDoneClick }: Props ) => {
	const translate = useTranslate();
	const patterns = useHeaderPatterns();
	const isSidebarRevampEnabled = isEnabled( 'pattern-assembler/sidebar-revamp' );

	return (
		<>
			{ isSidebarRevampEnabled && (
				<NavigatorHeader
					title={ translate( 'Header' ) }
					description={ translate(
						'Your header will be added to all pages and is usually where your site navigation lives.'
					) }
					onBack={ onBack }
				/>
			) }
			<div className="screen-container__body">
				<PatternSelector
					title={ ! isSidebarRevampEnabled ? translate( 'Add a header' ) : undefined }
					patterns={ patterns }
					onSelect={ onSelect }
					onBack={ onBack }
					selectedPattern={ selectedPattern }
					emptyPatternText={ isSidebarRevampEnabled ? translate( 'No Header' ) : undefined }
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

export default ScreenHeader;
