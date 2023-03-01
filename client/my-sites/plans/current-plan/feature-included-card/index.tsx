import { Button, Card } from '@automattic/components';

import './style.scss';

interface Props {
	title: string;
	text: string;
	illustration: string;
	showButton: boolean;
	buttonText?: string;
	buttonClick?: () => void;
}

const FeatureIncludedCard = ( props: Props ) => {
	const { illustration, title, text, showButton, buttonText, buttonClick } = props;

	return (
		<Card className="feature-included-card__card">
			<img className="feature-included-card__illustration" alt={ title } src={ illustration } />
			<div className="feature-included-card__content">
				<p className="feature-included-card__title">{ title }</p>
				<p className="feature-included-card__text">{ text }</p>
				{ showButton && (
					<Button className="feature-included-card__link" onClick={ buttonClick }>
						{ buttonText }
					</Button>
				) }
			</div>
		</Card>
	);
};

export default FeatureIncludedCard;
