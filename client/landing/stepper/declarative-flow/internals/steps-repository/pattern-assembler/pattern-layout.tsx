import { Button } from '@automattic/components';
import { AnimatePresence, LazyMotion, m } from 'framer-motion';
import { useTranslate } from 'i18n-calypso';
import PatternActionBar from './pattern-action-bar';
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

	const loadFeatures = () => import( './features.js' ).then( ( res ) => res.default );

	return (
		<div className="pattern-layout">
			<div className="pattern-layout__header">
				<h2>{ translate( 'Design your page' ) }</h2>
				<p>
					{ translate(
						'Kick start the content on your page by picking your patterns. First choose a header for your page layout, then choose at least one section pattern, and finally choose your footer.'
					) }
				</p>
			</div>
			<LazyMotion features={ loadFeatures }>
				<div className="pattern-layout__body">
					<ul>
						{ header ? (
							<li className="pattern-layout__list-item pattern-layout__list-item--header">
								<span className="pattern-layout__list-item-text" title={ header.name }>
									{ header.name }
								</span>
								<PatternActionBar onReplace={ onSelectHeader } onDelete={ onDeleteHeader } />
							</li>
						) : (
							<li className="pattern-layout__list-item pattern-layout__list-item--header">
								<Button onClick={ onSelectHeader }>
									<span className="pattern-layout__add-icon">+</span>{ ' ' }
									{ translate( 'Choose a header' ) }
								</Button>
							</li>
						) }
						<AnimatePresence initial={ false }>
							{ sections?.map( ( section, index ) => {
								const { name, key } = section as Pattern;
								return (
									<m.li
										layout={ 'position' }
										exit={ { opacity: 0, x: -50, transition: { duration: 0.2 } } }
										key={ `${ key }` }
										className="pattern-layout__list-item pattern-layout__list-item--section"
									>
										<span className="pattern-layout__list-item-text" title={ name }>
											{ name }
										</span>
										<PatternActionBar
											onReplace={ () => onSelectSection( index ) }
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
						</AnimatePresence>
						{ /* <AnimatePresence> */ }
						<li
							key={ `${ 'add-section-item' }` }
							className="pattern-layout__list-item pattern-layout__list-item--section"
						>
							<Button onClick={ () => onSelectSection( null ) }>
								<span className="pattern-layout__add-icon">+</span>{ ' ' }
								{ sections?.length
									? translate( 'Add another section' )
									: translate( 'Add a first section' ) }
							</Button>
						</li>
						{ /* </AnimatePresence> */ }
						{ footer ? (
							<li className="pattern-layout__list-item pattern-layout__list-item--footer">
								<span className="pattern-layout__list-item-text" title={ footer.name }>
									{ footer.name }
								</span>
								<PatternActionBar onReplace={ onSelectFooter } onDelete={ onDeleteFooter } />
							</li>
						) : (
							<li className="pattern-layout__list-item pattern-layout__list-item--footer">
								<Button onClick={ onSelectFooter }>
									<span className="pattern-layout__add-icon">+</span>{ ' ' }
									{ translate( 'Choose a footer' ) }
								</Button>
							</li>
						) }
					</ul>
				</div>
			</LazyMotion>
			<div className="pattern-layout__footer">
				<Button className="pattern-assembler__button" onClick={ onContinueClick } primary>
					{ translate( 'Continue' ) }
				</Button>
			</div>
		</div>
	);
};

export default PatternLayout;
