import { Button } from '@automattic/components';
import { Icon, plus } from '@wordpress/icons';
import AsyncLoad from 'calypso/components/async-load';
import PatternActionBar from './pattern-action-bar';
import type { Pattern } from './types';

type PatternLayoutProps = {
	patterns: Pattern[];
	onAddSection: () => void;
	onReplaceSection: ( position: number ) => void;
	onDeleteSection: ( position: number ) => void;
	onMoveUpSection: ( position: number ) => void;
	onMoveDownSection: ( position: number ) => void;
};

const PatternLayout = ( {
	patterns,
	onAddSection,
	onReplaceSection,
	onDeleteSection,
	onMoveUpSection,
	onMoveDownSection,
}: PatternLayoutProps ) => {
	return (
		<div className="pattern-layout">
			{ patterns.length > 0 && (
				<ul className="pattern-layout__list">
					<AsyncLoad require="./animate-list" featureName="domMax" placeholder={ <div /> }>
						{ ( m: any ) =>
							patterns.map( ( { category, key }: Pattern, index ) => {
								return (
									<m.li
										key={ key }
										layout="position"
										exit={ { opacity: 0, x: -50, transition: { duration: 0.2 } } }
										className="pattern-layout__list-item"
									>
										<span className="pattern-layout__list-item-text" title={ category }>
											{ `${ index + 1 }. ${ category }` }
										</span>
										<PatternActionBar
											patternType="section"
											onReplace={ () => onReplaceSection( index ) }
											onDelete={ () => onDeleteSection( index ) }
											onMoveUp={ () => onMoveUpSection( index ) }
											onMoveDown={ () => onMoveDownSection( index ) }
											enableMoving={ true }
											disableMoveUp={ index === 0 }
											disableMoveDown={ patterns?.length === index + 1 }
										/>
									</m.li>
								);
							} )
						}
					</AsyncLoad>
				</ul>
			) }
			<Button className="pattern-layout__button" onClick={ () => onAddSection() }>
				<Icon className="pattern-layout__button-icon" icon={ plus } size={ 32 } />
			</Button>
		</div>
	);
};

export default PatternLayout;
