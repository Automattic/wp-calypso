import { Button } from '@automattic/components';
import { __experimentalUseNavigator as useNavigator } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import NavigatorHeader from './navigator-header';
import PatternLayout from './pattern-layout';
import type { Pattern } from './types';

interface Props {
	sections: Pattern[];
	header: Pattern | null;
	footer: Pattern | null;
	onAddSection: () => void;
	onReplaceSection: ( position: number ) => void;
	onDeleteSection: ( position: number ) => void;
	onMoveUpSection: ( position: number ) => void;
	onMoveDownSection: ( position: number ) => void;
	onAddHeader: () => void;
	onDeleteHeader: () => void;
	onAddFooter: () => void;
	onDeleteFooter: () => void;
	onContinueClick: () => void;
}

const ScreenMainDeprecated = ( {
	sections,
	header,
	footer,
	onAddSection,
	onReplaceSection,
	onDeleteSection,
	onMoveUpSection,
	onMoveDownSection,
	onAddHeader,
	onDeleteHeader,
	onAddFooter,
	onDeleteFooter,
	onContinueClick,
}: Props ) => {
	const translate = useTranslate();
	const navigator = useNavigator();

	const goToHeaderPatterns = () => navigator.goTo( '/header' );

	const goToSectionPatterns = () => navigator.goTo( '/homepage/patterns' );

	const goToFooterPatterns = () => navigator.goTo( '/footer' );

	return (
		<>
			<NavigatorHeader
				title={ translate( 'Design your home' ) }
				description={ translate(
					'Choose from our library of patterns to quickly put together the structure of your homepage.'
				) }
			/>
			<div className="screen-container__body">
				<PatternLayout
					sections={ sections }
					header={ header }
					footer={ footer }
					onAddSection={ () => {
						onAddSection();
						goToSectionPatterns();
					} }
					onReplaceSection={ ( position ) => {
						onReplaceSection( position );
						goToSectionPatterns();
					} }
					onDeleteSection={ onDeleteSection }
					onMoveUpSection={ onMoveUpSection }
					onMoveDownSection={ onMoveDownSection }
					onAddHeader={ () => {
						onAddHeader();
						goToHeaderPatterns();
					} }
					onReplaceHeader={ goToHeaderPatterns }
					onDeleteHeader={ onDeleteHeader }
					onAddFooter={ () => {
						onAddFooter();
						goToFooterPatterns();
					} }
					onReplaceFooter={ goToFooterPatterns }
					onDeleteFooter={ onDeleteFooter }
				/>
			</div>
			<div className="screen-container__footer">
				<Button className="pattern-assembler__button" onClick={ onContinueClick } primary>
					{ translate( 'Continue' ) }
				</Button>
			</div>
		</>
	);
};

export default ScreenMainDeprecated;
