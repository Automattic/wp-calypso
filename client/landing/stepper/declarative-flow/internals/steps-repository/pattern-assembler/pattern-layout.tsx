import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import PatternActionBar from './pattern-action-bar';
import type { Pattern } from './types';

type PatternLayoutProps = {
	onContinueClick: () => void;
	onSelectFooter: () => void;
	onSelectSection: ( pattern: Pattern ) => void;
	onDeleteSection: ( pattern: Pattern ) => void;
	onOrderUpSection: ( pattern: Pattern ) => void;
	onOrderDownSection: ( pattern: Pattern ) => void;
	onSelectHeader: () => void;
	onDeleteHeader: () => void;
	onDeleteFooter: () => void;
	header: Pattern | null;
	sections: Pattern[] | null;
	footer: Pattern | null;
};

const PatternLayout = ( {
	onContinueClick,
	onSelectHeader,
	onSelectSection,
	onOrderUpSection,
	onOrderDownSection,
	onSelectFooter,
	onDeleteHeader,
	onDeleteFooter,
	onDeleteSection,
	header,
	sections,
	footer,
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
					{ header ? (
						<li className="pattern-layout__list-item --type-header-icon">
							<span className="pattern-layout__list-item-text" title={ header.name }>
								{ header.name }
							</span>
							<PatternActionBar onReplace={ onSelectHeader } onDelete={ onDeleteHeader } />
						</li>
					) : (
						<li
							className="pattern-layout__list-item --type-header-icon --action-color"
							onClick={ onSelectHeader }
							tabIndex={ 0 }
							role="button"
						>
							<span className="pattern-layout__add-icon">+</span> { translate( 'Choose a header' ) }
						</li>
					) }
					{ sections?.map( ( section, index ) => {
						const { id, name } = section;
						return (
							<li key={ id } className="pattern-layout__list-item --type-section-icon">
								<span className="pattern-layout__list-item-text" title={ name }>
									{ name }
								</span>
								<PatternActionBar
									onReplace={ () => onSelectSection( section ) }
									onDelete={ () => onDeleteSection( section ) }
									onOrderUp={ () => onOrderUpSection( section ) }
									onOrderDown={ () => onOrderDownSection( section ) }
									enableOrdering={ sections?.length > 1 }
									disableOrderUp={ index === 0 }
									disableOrderDown={ sections?.length === index + 1 }
								/>
							</li>
						);
					} ) }
					<li
						className="pattern-layout__list-item --type-section-icon --action-color"
						onClick={ () => onSelectSection() }
						tabIndex={ 0 }
						role="button"
					>
						<span className="pattern-layout__add-icon">+</span>{ ' ' }
						{ sections?.length
							? translate( 'Add another section' )
							: translate( 'Add a first section' ) }
					</li>
					{ footer ? (
						<li className="pattern-layout__list-item --type-footer-icon">
							<span className="pattern-layout__list-item-text" title={ footer.name }>
								{ footer.name }
							</span>
							<PatternActionBar onReplace={ onSelectFooter } onDelete={ onDeleteFooter } />
						</li>
					) : (
						<li
							className="pattern-layout__list-item --type-footer-icon --action-color"
							onClick={ onSelectFooter }
							tabIndex={ 0 }
							role="button"
						>
							<span className="pattern-layout__add-icon">+</span> { translate( 'Choose a footer' ) }
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
