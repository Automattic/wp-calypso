import { Button } from '@automattic/components';
import { NavigatorHeader } from '@automattic/onboarding';
import {
	__experimentalNavigatorBackButton as NavigatorBackButton,
	__experimentalUseNavigator as useNavigator,
} from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { NAVIGATOR_PATHS } from './constants';
import NavigatorTitle from './navigator-title';
import PatternLayout from './pattern-layout';
import type { Pattern } from './types';

interface Props {
	patterns: Pattern[];
	onAddSection: () => void;
	onReplaceSection: ( position: number ) => void;
	onDeleteSection: ( position: number ) => void;
	onMoveUpSection: ( position: number ) => void;
	onMoveDownSection: ( position: number ) => void;
	onBack: () => void;
}

const ScreenSection = ( {
	patterns,
	onAddSection,
	onReplaceSection,
	onDeleteSection,
	onMoveUpSection,
	onMoveDownSection,
	onBack,
}: Props ) => {
	const translate = useTranslate();
	const navigator = useNavigator();
	const goToPatternList = () => navigator.goTo( NAVIGATOR_PATHS.SECTION_PATTERNS );

	return (
		<>
			<NavigatorHeader
				title={ <NavigatorTitle title={ translate( 'Homepage' ) } /> }
				description={ translate(
					'Add and arrange patterns to make your homepage unique and help people understand instantly what the site’s about. '
				) }
				onBack={ onBack }
			/>
			<div className="screen-container__body">
				<PatternLayout
					sections={ patterns }
					onAddSection={ () => {
						onAddSection();
						goToPatternList();
					} }
					onReplaceSection={ ( position ) => {
						onReplaceSection( position );
						goToPatternList();
					} }
					onDeleteSection={ onDeleteSection }
					onMoveUpSection={ onMoveUpSection }
					onMoveDownSection={ onMoveDownSection }
				/>
			</div>
			<div className="screen-container__footer">
				<NavigatorBackButton as={ Button } className="pattern-assembler__button" primary>
					{ translate( 'Save homepage' ) }
				</NavigatorBackButton>
			</div>
		</>
	);
};

export default ScreenSection;
