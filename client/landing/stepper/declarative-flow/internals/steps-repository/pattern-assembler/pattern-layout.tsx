import { Button } from '@automattic/components';
import { Icon, plus } from '@wordpress/icons';
import classnames from 'classnames';
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
		<ul className="pattern-layout pattern-layout__list">
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
									{ category }
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
			<li className="pattern-layout__list-item">
				<Button className="pattern-layout__list-item-button" onClick={ () => onAddSection() }>
					<Icon
						className={ classnames( 'pattern-layout__icon', 'pattern-layout__icon-add' ) }
						icon={ plus }
						size={ 32 }
					/>
				</Button>
			</li>
		</ul>
	);
};

export default PatternLayout;
