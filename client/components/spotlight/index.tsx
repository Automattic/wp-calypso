import { Button } from '@automattic/components';

interface SpotlightProps {
	onClick: () => void;
	taglineText: string;
	illustrationSrc: string;
}

const Spotlight: React.FunctionComponent< SpotlightProps > = ( props: SpotlightProps ) => {
	const { taglineText, illustrationSrc, onClick } = props;

	return (
		<div className="spotlight" onClick={ onClick } onKeyDown={ onClick } role="link" tabIndex={ 0 }>
			<img className="spotlight__illustration" alt="Spotlight Logo" src={ illustrationSrc } />
			<div className="spotlight__content">
				<span className="spotlight__title">Under the Spotlight</span>
				<span className="spotlight__tagline">{ taglineText }</span>
			</div>
			<Button className="spotlight__cta" onClick={ onClick }>
				View Details
			</Button>
		</div>
	);
};

export default Spotlight;
