import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Plans } from '@automattic/data-stores';
import { useEffect } from '@wordpress/element';

type Location = 'plans' | 'trialexpired' | 'homescreen' | 'checkout';

/**
 * Fires a track if the site has a $1 offer.
 * @param siteId Site ID
 * @param location Location of the track being fired, i.e. 'plans', 'trialexpired', 'homescreen', 'checkout'
 */
const useOneDollarOfferTrack = ( siteId: number | null | undefined, location: Location ) => {
	const wooExpressIntroOffers = Plans.useIntroOffersForWooExpress( { siteId, coupon: undefined } );
	const hasWooExpressIntroOffer = Object.values( wooExpressIntroOffers ?? {} ).length > 0;

	useEffect( () => {
		if ( ! location || ! hasWooExpressIntroOffer ) {
			return;
		}

		recordTracksEvent( 'calypso_wooexpress_one_dollar_offer', {
			location,
		} );
	}, [ hasWooExpressIntroOffer, location ] );
};

export default useOneDollarOfferTrack;
