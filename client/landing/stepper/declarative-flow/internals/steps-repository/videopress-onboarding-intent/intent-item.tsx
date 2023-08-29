interface Props {
	title: string;
	description: string;
	image: string;
	onClick: () => void;
}

const VideoPressOnboardingIntentItem = ( props: Props ) => {
	const { title, image, description, onClick } = props;

	return (
		<div className="videopress-intent-item">
			<button className="videopress-intent-item__preview" onClick={ onClick }>
				<img src={ image } alt={ title } />
			</button>
			<div className="videopress-intent-item__description">
				<span className="videopress-intent-item__title">{ title }</span>
				<span className="videopress-intent-item__description">{ description }</span>
			</div>
		</div>
	);
};

export default VideoPressOnboardingIntentItem;
