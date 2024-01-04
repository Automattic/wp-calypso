import './design-choice.scss';

interface Props {
	title: string;
	description: string;
	imageSrc: string;
	destination: string;
	onSelect: ( destination: string ) => void;
}

const DesignChoice = ( { title, description, imageSrc, destination, onSelect }: Props ) => (
	<button className="design-choice" onClick={ () => onSelect( destination ) }>
		<div className="design-choice__title">{ title }</div>
		<div className="design-choice__description">{ description }</div>
		<img className="design-choice__image" src={ imageSrc } alt={ title } />
	</button>
);

export default DesignChoice;
