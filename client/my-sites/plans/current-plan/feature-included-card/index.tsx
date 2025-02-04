import { Button, Card } from '@automattic/components';
import clsx from 'clsx';

import './style.scss';

interface Props {
	title: string;
	text: string;
	illustration?: string;
	showButton: boolean;
	reducedPadding?: boolean;
	buttonText?: string;
	buttonClick?: () => void;
}

const FeatureIncludedCard = ( props: Props ) => {
	const { illustration, title, text, showButton, buttonText, buttonClick, reducedPadding } = props;

	return (
		<Card
			className={ clsx( 'feature-included-card__card', {
				[ 'reduced-padding' ]: reducedPadding,
			} ) }
		>
			{ illustration && (
				<img className="feature-included-card__illustration" alt={ title } src={ illustration } />
			) }
			<div className="feature-included-card__content">
				<p
					className={ clsx( 'feature-included-card__title', {
						[ 'reduced-padding' ]: reducedPadding,
					} ) }
				>
					{ title }
				</p>
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
