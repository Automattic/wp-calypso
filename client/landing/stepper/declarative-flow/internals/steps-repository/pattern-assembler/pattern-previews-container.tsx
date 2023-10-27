import classnames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import PatternLargePreview from './pattern-large-preview';
import './pattern-previews-container.scss';

type PatternPreviewsContainerProps = {
	header: Pattern | null;
	sections: Pattern[];
	footer: Pattern | null;
	activePosition: number;
	onDeleteSection: ( position: number ) => void;
	onMoveUpSection: ( position: number ) => void;
	onMoveDownSection: ( position: number ) => void;
	onDeleteHeader: () => void;
	onDeleteFooter: () => void;
	onShuffle: ( type: string, pattern: Pattern, position?: number ) => void;
	recordTracksEvent: ( name: string, eventProperties?: any ) => void;
	isGridLayout: boolean;
	isNewSite: boolean;
};

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
	isGridLayout,
	isNewSite,
}: PatternPreviewsContainerProps ) => {
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
