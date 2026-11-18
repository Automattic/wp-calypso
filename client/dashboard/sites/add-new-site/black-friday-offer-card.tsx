import { __experimentalText as Text } from '@wordpress/components';
import { addQueryArgs } from '@wordpress/url';
import { useEffect } from 'react';
import { useAnalytics } from '../../app/analytics';
import BlackFriday2026Artwork from '../../components/black-friday-2026-artwork';
import OfferCard from '../../components/offer-card';
import { getBlackFriday2026CardCopy } from '../../utils/black-friday-2026';
import { wpcomLink } from '../../utils/link';
import type { BlackFriday2026Offer } from 'calypso/lib/promotions/black-friday-2026';

export default function BlackFridayOfferCard( {
	offer,
	onClick,
}: {
	offer: BlackFriday2026Offer;
	onClick?: () => void;
} ) {
	const { recordTracksEvent } = useAnalytics();
	const { title, description, ctaLabel } = getBlackFriday2026CardCopy( offer );
	const eventProps = { discount_percent: offer.percent };

	useEffect( () => {
		recordTracksEvent( 'calypso_bf2026_add_site_promo_view', eventProps );
		// Record once per mount.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );

	return (
		<OfferCard
			layout="stacked"
			className="offer-card--bf2026"
			image={ <BlackFriday2026Artwork percent={ offer.isLifecycle ? 30 : 25 } /> }
			title={
				<Text size={ 14 } weight={ 600 } lineHeight="20px">
					{ title }
				</Text>
			}
			description={ description }
			ctaLabel={ ctaLabel }
			href={ addQueryArgs( wpcomLink( '/setup/onboarding' ), { coupon: offer.coupon } ) }
			onClick={ () => {
				onClick?.();
				recordTracksEvent( 'calypso_bf2026_add_site_promo_click', eventProps );
			} }
		/>
	);
}
