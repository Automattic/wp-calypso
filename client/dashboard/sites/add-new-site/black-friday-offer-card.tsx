import { __, sprintf } from '@wordpress/i18n';
import { addQueryArgs } from '@wordpress/url';
import { useEffect } from 'react';
import {
	BLACK_FRIDAY_2026_COUPON,
	BLACK_FRIDAY_2026_DISCOUNT_PERCENT,
} from 'calypso/lib/promotions/black-friday-2026';
import { useAnalytics } from '../../app/analytics';
import OfferCard from '../../components/offer-card';
import { wpcomLink } from '../../utils/link';

export default function BlackFridayOfferCard( { onClick }: { onClick?: () => void } ) {
	const { recordTracksEvent } = useAnalytics();

	useEffect( () => {
		recordTracksEvent( 'calypso_bf2026_add_site_promo_view' );
		// Record once per mount.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );

	return (
		<OfferCard
			layout="stacked"
			title={ sprintf(
				// translators: %d is the discount percentage, for example 25
				__( 'Black Friday: %d%% off annual plans' ),
				BLACK_FRIDAY_2026_DISCOUNT_PERCENT
			) }
			description={ sprintf(
				// translators: %d is the discount percentage, for example 25
				__( 'Upgrade today and pay %d%% less for your first year.' ),
				BLACK_FRIDAY_2026_DISCOUNT_PERCENT
			) }
			ctaLabel={ sprintf(
				// translators: %d is the discount percentage, for example 25
				__( 'Get %d%% off' ),
				BLACK_FRIDAY_2026_DISCOUNT_PERCENT
			) }
			href={ addQueryArgs( wpcomLink( '/setup/onboarding' ), {
				coupon: BLACK_FRIDAY_2026_COUPON,
			} ) }
			onClick={ () => {
				onClick?.();
				recordTracksEvent( 'calypso_bf2026_add_site_promo_click' );
			} }
		/>
	);
}
