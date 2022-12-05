import { Button } from '@automattic/components';
import { Icon, header, footer, group } from '@wordpress/icons';
import classnames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import AsyncLoad from 'calypso/components/async-load';
import PatternActionBar from './pattern-action-bar';
import type { Pattern } from './types';

type PatternLayoutProps = {
	header: Pattern | null;
	sections: Pattern[];
	footer: Pattern | null;
	onAddHeader: () => void;
	onReplaceHeader: () => void;
	onDeleteHeader: () => void;
	onAddSection: () => void;
	onReplaceSection: ( position: number ) => void;
	onDeleteSection: ( position: number ) => void;
	onMoveUpSection: ( position: number ) => void;
	onMoveDownSection: ( position: number ) => void;
	onAddFooter: () => void;
	onReplaceFooter: () => void;
	onDeleteFooter: () => void;
	onContinueClick: () => void;
};

const PatternLayout = ( {
	header: selectedHeader,
	sections,
	footer: selectedFooter,
	onAddHeader,
	onReplaceHeader,
	onDeleteHeader,
	onAddSection,
	onReplaceSection,
	onDeleteSection,
	onMoveUpSection,
	onMoveDownSection,
	onAddFooter,
	onReplaceFooter,
	onDeleteFooter,
	onContinueClick,
}: PatternLayoutProps ) => {
	const translate = useTranslate();

	return (
		<div className="pattern-layout">
			<div className="pattern-layout__header">
				<h2>{ translate( 'Design your home' ) }</h2>
				<p>
					{ translate(
						'Choose from our library of patterns to quickly put together the structure of your homepage.'
					) }
				</p>
			</div>
			<div className="pattern-layout__body">
				<ul>
					{ selectedHeader ? (
						<li className="pattern-layout__list-item pattern-layout__list-item--header">
							<Icon className="pattern-layout__icon" icon={ header } size={ 24 } />
							<span className="pattern-layout__list-item-text" title={ selectedHeader.name }>
								{ selectedHeader.name }
							</span>
							<PatternActionBar
								patternType="header"
								onReplace={ onReplaceHeader }
								onDelete={ onDeleteHeader }
							/>
						</li>
					) : (
						<li className="pattern-layout__list-item pattern-layout__list-item--header">
							<Button className="pattern-layout__list-item-button" onClick={ onAddHeader }>
								<span
									className={ classnames( 'pattern-layout__icon', 'pattern-layout__icon-add' ) }
								>
									+
								</span>
								{ translate( 'Add a header' ) }
							</Button>
						</li>
					) }
					<AsyncLoad require="./animate-list" featureName="domMax" placeholder={ <div /> }>
						{ ( m: any ) =>
							sections.map( ( { name, key }: Pattern, index ) => {
								return (
									<m.li
										key={ key }
										layout="position"
										exit={ { opacity: 0, x: -50, transition: { duration: 0.2 } } }
										className="pattern-layout__list-item pattern-layout__list-item--section"
									>
										<Icon className="pattern-layout__icon" icon={ group } size={ 24 } />
										<span className="pattern-layout__list-item-text" title={ name }>
											{ name }
										</span>
										<PatternActionBar
											patternType="section"
											onReplace={ () => onReplaceSection( index ) }
											onDelete={ () => onDeleteSection( index ) }
											onMoveUp={ () => onMoveUpSection( index ) }
											onMoveDown={ () => onMoveDownSection( index ) }
											enableMoving={ true }
											disableMoveUp={ index === 0 }
											disableMoveDown={ sections?.length === index + 1 }
										/>
									</m.li>
								);
							} )
						}
					</AsyncLoad>
					<li className="pattern-layout__list-item pattern-layout__list-item--section">
						<Button className="pattern-layout__list-item-button" onClick={ () => onAddSection() }>
							<span className={ classnames( 'pattern-layout__icon', 'pattern-layout__icon-add' ) }>
								+
							</span>
							{ translate( 'Add sections' ) }
						</Button>
					</li>
					{ selectedFooter ? (
						<li className="pattern-layout__list-item pattern-layout__list-item--footer">
							<Icon className="pattern-layout__icon" icon={ footer } size={ 24 } />
							<span className="pattern-layout__list-item-text" title={ selectedFooter.name }>
								{ selectedFooter.name }
							</span>
							<PatternActionBar
								patternType="footer"
								onReplace={ onReplaceFooter }
								onDelete={ onDeleteFooter }
							/>
						</li>
					) : (
						<li className="pattern-layout__list-item pattern-layout__list-item--footer">
							<Button className="pattern-layout__list-item-button" onClick={ onAddFooter }>
								<span
									className={ classnames( 'pattern-layout__icon', 'pattern-layout__icon-add' ) }
								>
									+
								</span>
								{ translate( 'Add a footer' ) }
							</Button>
						</li>
					) }
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
