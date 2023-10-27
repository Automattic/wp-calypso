import classnames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import PatternLargePreview from './pattern-large-preview';
import './pattern-previews-container.scss';

const PatternPreviewsContainer = ( {
	header,
	sections,
	footer,
	activePosition,
	onDeleteSection,
	onMoveUpSection,
	onMoveDownSection,
	onDeleteHeader,
	onDeleteFooter,
	onShuffle,
	recordTracksEvent,
	isNewSite,
	isGridLayout,
} ) => {
	const translate = useTranslate();

	return (
		<div
			className={ classnames( 'pattern-assembler__previews', {
				'pattern-assembler__previews--grid': isGridLayout,
			} ) }
		>
			<div className="pattern-assembler__preview">
				<PatternLargePreview
					header={ header }
					sections={ sections }
					footer={ footer }
					activePosition={ activePosition }
					onDeleteSection={ onDeleteSection }
					onMoveUpSection={ onMoveUpSection }
					onMoveDownSection={ onMoveDownSection }
					onDeleteHeader={ onDeleteHeader }
					onDeleteFooter={ onDeleteFooter }
					onShuffle={ onShuffle }
					recordTracksEvent={ recordTracksEvent }
					isDisableActionBar={ isGridLayout }
					isNewSite={ isNewSite }
				/>
				{ isGridLayout && (
					<div className="pattern-assembler__preview-title">{ translate( 'Homepage' ) }</div>
				) }
			</div>
		</div>
	);
};

export default PatternPreviewsContainer;
