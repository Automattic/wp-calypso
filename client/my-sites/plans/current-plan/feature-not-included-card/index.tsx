import { Card, Gridicon } from '@automattic/components';

import './style.scss';

interface Props {
	illustration: string;
	text: string;
	title: string;
}

const FeatureNotIncludedCard = ( props: Props ) => {
	const { illustration, title, text } = props;

	return (
		<Card className="feature-not-included-card__card">
			<img className="feature-not-included-card__illustration" alt={ title } src={ illustration } />
			<div>
				<Gridicon className="feature-not-included-card__cross" icon="cross" size={ 24 } />
			</div>
			<div className="feature-not-included-card__content">
				<p className="feature-not-included-card__title">{ title }</p>
				<p className="feature-not-included-card__text">{ text }</p>
			</div>
		</Card>
	);
};

export default FeatureNotIncludedCard;
