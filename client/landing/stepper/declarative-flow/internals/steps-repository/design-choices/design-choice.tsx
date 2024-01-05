import classnames from 'classnames';
import './design-choice.scss';

interface Props {
	className?: string;
	title: string;
	description: string;
	imageSrc: string;
	destination: string;
	onSelect: ( destination: string ) => void;
}

const DesignChoice = ( {
	className,
	title,
	description,
	imageSrc,
	destination,
	onSelect,
}: Props ) => (
	<button
		className={ classnames( 'design-choice', className ) }
		onClick={ () => onSelect( destination ) }
	>
		<div className="design-choice__title">{ title }</div>
		<div className="design-choice__description">{ description }</div>
		<div className="design-choice__image-container">
			<img src={ imageSrc } alt={ title } />
		</div>
	</button>
);

export default DesignChoice;
