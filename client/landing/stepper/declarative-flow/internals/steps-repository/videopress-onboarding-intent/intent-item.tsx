interface Props {
	title: string;
	description: string;
	image: string;
	onClick: () => void;
}

const VideoPressOnboardingIntentItem = ( props: Props ) => {
	const { title, image, description, onClick } = props;

	// Replace last space between words in description with nbsp
	const descriptionWithNbsp = description.replace( /\s(?=[^\s]*$)/, '\u00a0' );

	return (
		<div className="videopress-intent-item">
			<button className="videopress-intent-item__preview" onClick={ onClick }>
				<img src={ image } alt={ title } />
			</button>
			<div className="videopress-intent-item__description">
				<span className="videopress-intent-item__title">{ title }</span>
				<span className="videopress-intent-item__description">{ descriptionWithNbsp }</span>
			</div>
		</div>
	);
};

export default VideoPressOnboardingIntentItem;
