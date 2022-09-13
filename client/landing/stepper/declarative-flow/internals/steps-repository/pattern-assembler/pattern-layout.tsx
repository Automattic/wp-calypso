import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import PatternListItem from './pattern-list-item';
import type { Pattern } from './types';

type PatternLayoutProps = {
	header: Pattern | null;
	sections: Pattern[] | null;
	footer: Pattern | null;
	onSelectHeader: () => void;
	onDeleteHeader: () => void;
	onSelectSection: ( position: number | null ) => void;
	onDeleteSection: ( position: number ) => void;
	onMoveUpSection: ( position: number ) => void;
	onMoveDownSection: ( position: number ) => void;
	onSelectFooter: () => void;
	onDeleteFooter: () => void;
	onContinueClick: () => void;
};

const PatternLayout = ( {
	header,
	sections,
	footer,
	onSelectHeader,
	onDeleteHeader,
	onSelectSection,
	onDeleteSection,
	onMoveUpSection,
	onMoveDownSection,
	onSelectFooter,
	onDeleteFooter,
	onContinueClick,
}: PatternLayoutProps ) => {
	const translate = useTranslate();

	return (
		<div className="pattern-layout">
			<div className="pattern-layout__header">
				<h2>{ translate( 'Design your page' ) }</h2>
				<p>{ translate( 'Kick start the content on your page by picking patterns.' ) }</p>
			</div>
			<div className="pattern-layout__body">
				<ul>
					<PatternListItem
						patternType={ 'header' }
						header={ header }
						onSelectHeader={ onSelectHeader }
						onDeleteHeader={ onDeleteHeader }
					/>
					{ sections?.map( ( section, index ) => {
						const { id } = section;
						return (
							<PatternListItem
								patternType={ 'section' }
								section={ section }
								key={ `${ index }-${ id }` }
								onSelectSection={ () => onSelectSection( index ) }
								onDeleteSection={ () => onDeleteSection( index ) }
								onMoveUpSection={ () => onMoveUpSection( index ) }
								onMoveDownSection={ () => onMoveDownSection( index ) }
								disableMoveUp={ index === 0 }
								disableMoveDown={ sections?.length === index + 1 }
							/>
						);
					} ) }
					<PatternListItem
						patternType={ 'sections' }
						sections={ sections }
						onSelectSection={ () => onSelectSection( null ) }
					/>
					<PatternListItem
						patternType={ 'footer' }
						footer={ footer }
						onSelectFooter={ onSelectFooter }
						onDeleteFooter={ onDeleteFooter }
					/>
				</ul>
			</div>
			<div className="pattern-layout__footer">
				<Button className="pattern-assembler__button" onClick={ onContinueClick } primary>
					{ translate( 'Continue' ) }
				</Button>
			</div>
		</div>
	);
};

export default PatternLayout;
