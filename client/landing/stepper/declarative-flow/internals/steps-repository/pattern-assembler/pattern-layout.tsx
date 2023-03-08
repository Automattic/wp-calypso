import { isEnabled } from '@automattic/calypso-config';
import { Button } from '@automattic/components';
import { Icon, header, footer, group } from '@wordpress/icons';
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
};

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

const PatternLayout = ( {
	header: selectedHeader,
	sections,
	footer: selectedFooter,
	onAddHeader = noop,
	onReplaceHeader = noop,
	onDeleteHeader = noop,
	onAddSection,
	onReplaceSection,
	onDeleteSection,
	onMoveUpSection,
	onMoveDownSection,
	onAddFooter = noop,
	onReplaceFooter = noop,
	onDeleteFooter = noop,
}: PatternLayoutProps ) => {
	const translate = useTranslate();
	const isSidebarRevampEnabled = isEnabled( 'pattern-assembler/sidebar-revamp' );

	if ( ! isSidebarRevampEnabled ) {
		return (
			<div className="pattern-layout">
				<AsyncLoad require="./animate-list" featureName="domMax" placeholder={ <div /> }>
					{ ( m: any ) => (
						<m.ul className="pattern-layout__list" layoutScroll>
							{ selectedHeader ? (
								<li className="pattern-layout__list-item">
									<Icon className="pattern-layout__icon" icon={ header } size={ 24 } />
									<span
										className="pattern-layout__list-item-text"
										title={ selectedHeader.category }
									>
										{ selectedHeader.category }
									</span>
									<PatternActionBar
										patternType="header"
										onReplace={ onReplaceHeader }
										onDelete={ onDeleteHeader }
									/>
								</li>
							) : (
								<li className="pattern-layout__list-item">
									<Button className="pattern-layout__add-button" onClick={ onAddHeader }>
										<span className="pattern-layout__add-button-icon">+</span>
										{ translate( 'Add a header' ) }
									</Button>
								</li>
							) }
							{ sections.length > 0 &&
								sections.map( ( { category, key }: Pattern, index ) => {
									return (
										<m.li
											key={ key }
											layout="position"
											exit={ { opacity: 0, x: -50, transition: { duration: 0.2 } } }
											className="pattern-layout__list-item"
										>
											<Icon className="pattern-layout__icon" icon={ group } size={ 24 } />
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
												disableMoveDown={ sections?.length === index + 1 }
											/>
										</m.li>
									);
								} ) }
							<li className="pattern-layout__list-item">
								<Button className="pattern-layout__add-button" onClick={ () => onAddSection() }>
									<span className="pattern-layout__add-button-icon">+</span>
									{ translate( 'Add sections' ) }
								</Button>
							</li>
							{ selectedFooter ? (
								<li className="pattern-layout__list-item">
									<Icon className="pattern-layout__icon" icon={ footer } size={ 24 } />
									<span
										className="pattern-layout__list-item-text"
										title={ selectedFooter.category }
									>
										{ selectedFooter.category }
									</span>
									<PatternActionBar
										patternType="footer"
										onReplace={ onReplaceFooter }
										onDelete={ onDeleteFooter }
									/>
								</li>
							) : (
								<li className="pattern-layout__list-item">
									<Button className="pattern-layout__add-button" onClick={ onAddFooter }>
										<span className="pattern-layout__add-button-icon">+</span>
										{ translate( 'Add a footer' ) }
									</Button>
								</li>
							) }
						</m.ul>
					) }
				</AsyncLoad>
			</div>
		);
	}

	return (
		<div className="pattern-layout">
			{ sections.length > 0 && (
				<AsyncLoad require="./animate-list" featureName="domMax" placeholder={ <div /> }>
					{ ( m: any ) => (
						<m.ul className="pattern-layout__list" layoutScroll>
							{ sections.map( ( { category, key }: Pattern, index ) => {
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
				{ translate( 'Add patterns' ) }
			</Button>
		</div>
	);
};

export default PatternLayout;
