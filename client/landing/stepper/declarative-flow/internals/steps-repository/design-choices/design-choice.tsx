import clsx from 'clsx';
import { preventWidows } from 'calypso/lib/formatting';
import './design-choice.scss';

interface Props {
	className?: string;
	title: string;
	description: string;
	imageSrc: string;
	destination: string;
	footer?: React.ReactNode;
	onSelect: ( destination: string ) => void;
}

const DesignChoice = ( {
	className,
	title,
	description,
	imageSrc,
	destination,
	footer,
	onSelect,
}: Props ) => (
	<button
		className={ clsx( 'design-choice', className ) }
		aria-label={ title }
		onClick={ () => onSelect( destination ) }
	>
		<div className="design-choice__title">{ title }</div>
		<div className="design-choice__description">{ preventWidows( description ) }</div>
		<div className="design-choice__image-container">
			<img src={ imageSrc } alt={ title } />
			{ footer ? <div className="design-choice__footer">{ footer }</div> : null }
		</div>
	</button>
);

export default DesignChoice;
