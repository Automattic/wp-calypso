import { Button } from '@automattic/components';

import './style.scss';

interface SpotlightProps {
	onClick: () => void;
	taglineText: string;
	illustrationSrc: string;
}

const Spotlight: React.FunctionComponent< SpotlightProps > = ( props: SpotlightProps ) => {
	const { taglineText, illustrationSrc, onClick } = props;

	return (
		<div className="spotlight" onClick={ onClick } onKeyDown={ onClick } role="link" tabIndex={ 0 }>
			<div className="spotlight__content">
				<img className="spotlight__illustration" alt="Spotlight Logo" src={ illustrationSrc } />
				<div className="spotlight__text-container">
					<span className="spotlight__title">Under the Spotlight</span>
					<span className="spotlight__tagline">{ taglineText }</span>
				</div>
			</div>
			<div className="spotlight__cta">
				<Button onClick={ onClick }>View Details</Button>
			</div>
		</div>
	);
};

export default Spotlight;
