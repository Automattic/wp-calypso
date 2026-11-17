import { __experimentalText as Text } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { addQueryArgs } from '@wordpress/url';
import { useEffect } from 'react';
import {
	BLACK_FRIDAY_2026_COUPON,
	BLACK_FRIDAY_2026_DISCOUNT_PERCENT,
	BLACK_FRIDAY_2026_MONTHLY_SAVINGS_PERCENT,
} from 'calypso/lib/promotions/black-friday-2026';
import { useAnalytics } from '../../app/analytics';
import BlackFriday2026Artwork from '../../components/black-friday-2026-artwork';
import OfferCard from '../../components/offer-card';
import { wpcomLink } from '../../utils/link';

export default function BlackFridayOfferCard( { onClick }: { onClick?: () => void } ) {
	const { recordTracksEvent } = useAnalytics();
	const percent = BLACK_FRIDAY_2026_DISCOUNT_PERCENT;

	useEffect( () => {
		recordTracksEvent( 'calypso_bf2026_add_site_promo_view' );
		// Record once per mount.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );

	return (
		<OfferCard
			layout="stacked"
			className="offer-card--bf2026"
			image={ <BlackFriday2026Artwork /> }
			title={
				<Text size={ 14 } weight={ 600 } lineHeight="20px">
					{ sprintf(
						/* translators: %(percent)d is the discount percentage, e.g. 25 */
						__( '%(percent)d%% off annual and multi-year plans' ),
						{ percent }
					) }
				</Text>
			}
			description={ sprintf(
				/* translators: %(savings)d is the largest saving compared with monthly billing, as a percentage, e.g. 66 */
				__( 'That’s up to %(savings)d%% less than paying monthly. Sale ends December 1.' ),
				{ savings: BLACK_FRIDAY_2026_MONTHLY_SAVINGS_PERCENT }
			) }
			ctaLabel={ sprintf(
				/* translators: %(percent)d is the discount percentage, e.g. 25 */
				__( 'Get %(percent)d%% off' ),
				{ percent }
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
