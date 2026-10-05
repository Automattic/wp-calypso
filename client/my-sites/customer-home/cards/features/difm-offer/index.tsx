import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Button, Card } from '@automattic/components';
import TrackComponentView from 'calypso/lib/analytics/track-component-view';
import useMyHomeDifmOffer from './use-my-home-difm-offer';

import './style.scss';

const UPSELL_ID = 'home-difm-offer';
const UPSELL_FEATURE_ID = 'difm-offer';

export default function DifmOffer() {
	const { copy, variation } = useMyHomeDifmOffer();

	if ( ! copy ) {
		return null;
	}

	const tracksProps = {
		upsell_id: UPSELL_ID,
		upsell_feature_id: UPSELL_FEATURE_ID,
		variation,
	};

	const handleCtaClick = () => {
		recordTracksEvent( 'calypso_my_home_difm_offer_cta_click', tracksProps );
		// The offer modal opens here in a follow-up.
	};

	return (
		<Card className="difm-offer__card customer-home__card is-large-hero">
			<TrackComponentView
				eventName="calypso_my_home_difm_offer_impression"
				eventProperties={ tracksProps }
			/>
			<h3>{ copy.title }</h3>
			<p className="difm-offer__description">{ copy.description }</p>
			<div className="difm-offer__actions">
				<Button primary onClick={ handleCtaClick }>
					{ copy.ctaText }
				</Button>
			</div>
		</Card>
	);
}
