import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import AsyncLoad from 'calypso/components/async-load';
import PatternActionBar from './pattern-action-bar';
import type { Pattern } from './types';

type PatternLayoutProps = {
	header?: Pattern | null;
	sections: Pattern[];
	footer?: Pattern | null;
	onAddHeader?: () => void;
	onReplaceHeader?: () => void;
	onDeleteHeader?: () => void;
	onAddSection: () => void;
	onReplaceSection: ( position: number ) => void;
	onDeleteSection: ( position: number ) => void;
	onMoveUpSection: ( position: number ) => void;
	onMoveDownSection: ( position: number ) => void;
	onAddFooter?: () => void;
	onReplaceFooter?: () => void;
	onDeleteFooter?: () => void;
	onShuffle: ( type: string, pattern: Pattern, position?: number ) => void;
};

const PatternLayout = ( {
	sections,
	onAddSection,
	onReplaceSection,
	onDeleteSection,
	onMoveUpSection,
	onMoveDownSection,
	onShuffle,
}: PatternLayoutProps ) => {
	const translate = useTranslate();

	return (
		<div className="pattern-layout">
			{ sections.length > 0 && (
				<AsyncLoad require="./animate-list" featureName="domMax" placeholder={ <div /> }>
					{ ( m: any ) => (
						<m.ul className="pattern-layout__list" layoutScroll>
							{ sections.map( ( pattern: Pattern, index ) => {
								const { title, category, key } = pattern;
								return (
									<m.li
										key={ key }
										layout="position"
										exit={ { opacity: 0, x: -50, transition: { duration: 0.2 } } }
										className="pattern-layout__list-item"
									>
										<span className="pattern-layout__list-item-text" title={ title }>
											{ `${ index + 1 }. ${ category?.label }` }
										</span>
										<PatternActionBar
											patternType="section"
											source="list"
											onReplace={ () => onReplaceSection( index ) }
											onDelete={ () => onDeleteSection( index ) }
											onMoveUp={ () => onMoveUpSection( index ) }
											onMoveDown={ () => onMoveDownSection( index ) }
											onShuffle={ () => onShuffle( 'sections', pattern, index ) }
											disableMoveUp={ index === 0 }
											disableMoveDown={ sections?.length === index + 1 }
										/>
									</m.li>
								);
							} ) }
						</m.ul>
					) }
				</AsyncLoad>
			) }
			<Button className="pattern-layout__add-button" onClick={ () => onAddSection() }>
				<span className="pattern-layout__add-button-icon">+</span>
				{ translate( 'Add sections' ) }
			</Button>
		</div>
	);
};

export default PatternLayout;
