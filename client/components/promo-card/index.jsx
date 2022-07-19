import { Card, Button } from '@automattic/components';
import FormattedHeader from 'calypso/components/formatted-header';
import TrackComponentView from 'calypso/lib/analytics/track-component-view';

import './style.scss';

const PromoCard = ( { headerText, contentText, image, eventName, ctaText, onClick } ) => {
	return (
		<Card className="promo-card">
			<TrackComponentView eventName={ eventName } />
			<img src={ image } alt="" aria-hidden="true" />
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
