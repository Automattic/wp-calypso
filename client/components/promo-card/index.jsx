import { Card, Button } from '@automattic/components';
import FormattedHeader from 'calypso/components/formatted-header';

import './style.scss';

const PromoCard = ( { headerText, contentText, image, ctaText, onClick } ) => {
	return (
		<Card className="promo-card">
			<img src={ image } alt="" />
			<div className="promo-card__text">
				<FormattedHeader brandFont headerText={ headerText } align="left" />
				<p>{ contentText }</p>
				<Button primary onClick={ onClick } target="_blank">
					{ ctaText }
				</Button>
			</div>
		</Card>
	);
};

export default PromoCard;
