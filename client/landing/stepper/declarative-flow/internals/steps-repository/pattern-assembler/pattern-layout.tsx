import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import type { Pattern } from './types';

type PatternLayoutProps = {
	onContinueClick: () => void;
	onSelectFooter: () => void;
	onDeleteFooter: () => void;
	onSelectSection: ( pattern: Pattern ) => void;
	onDeleteSection: () => void;
	onSelectHeader: () => void;
	onDeleteHeader: () => void;
	header: Pattern | null;
	sections: Pattern[] | null;
	footer: Pattern | null;
};

const PatternLayout = ( {
	onContinueClick,
	onSelectHeader,
	onSelectSection,
	onSelectFooter,
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
						<li className="pattern-layout__list-item" onClick={ onSelectHeader }>
							{ header.name }
						</li>
					) : (
						<li className="pattern-layout__list-item" onClick={ onSelectHeader }>
							+ { translate( 'Choose a header' ) }
						</li>
					) }
					{ sections?.map( ( { id, name } ) => (
						<li
							key={ id }
							className="pattern-layout__list-item"
							onClick={ () => onSelectSection( { id, name } ) }
						>
							{ name }
						</li>
					) ) }
					{ sections?.length ? (
						<li className="pattern-layout__list-item" onClick={ () => onSelectSection() }>
							+ { translate( 'Add another section' ) }
						</li>
					) : (
						<li className="pattern-layout__list-item" onClick={ () => onSelectSection() }>
							+ { translate( 'Add a first section' ) }
						</li>
					) }
					{ footer ? (
						<li className="pattern-layout__list-item" onClick={ onSelectFooter }>
							{ footer.name }
						</li>
					) : (
						<li className="pattern-layout__list-item" onClick={ onSelectFooter }>
							+ { translate( 'Choose a footer' ) }
						</li>
					) }
				</ul>
			</div>
			<div className="pattern-layout__footer">
				<Button
					className="pattern-layout__button pattern-layout__button-continue"
					onClick={ onContinueClick }
					primary
				>
					{ translate( 'Continue' ) }
				</Button>
			</div>
		</div>
	);
};

export default PatternLayout;
