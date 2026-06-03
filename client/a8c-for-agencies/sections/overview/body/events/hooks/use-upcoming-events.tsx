import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import moment from 'moment';
import { useMemo } from 'react';
import { UpcomingEventProps } from 'calypso/a8c-for-agencies/components/upcoming-event/types';
import usePressableOwnershipType from 'calypso/a8c-for-agencies/sections/marketplace/hosting-overview/hooks/use-pressable-ownership-type';
import PressableLogo from 'calypso/assets/images/a8c-for-agencies/events/pressable-logo.svg';
import WordCampAsia2026Image from 'calypso/assets/images/a8c-for-agencies/events/wordcamp-asia2026-compliment-image.svg';
import WordCampAsia2026Logo from 'calypso/assets/images/a8c-for-agencies/events/wordcamp-asia2026-image.svg';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { useSelector } from 'calypso/state';
import { getActiveAgency } from 'calypso/state/a8c-for-agencies/agency/selectors';

export const useUpcomingEvents = () => {
	const translate = useTranslate();
	const localizedMoment = useLocalizedMoment();

	const agency = useSelector( getActiveAgency );

	const pressableOwnership = usePressableOwnershipType();

	const shouldShowPressablePromoOffer =
		agency?.billing_system === 'billingdragon' && pressableOwnership !== 'agency';

	return useMemo( () => {
		const eventsData: UpcomingEventProps[] = [
			{
				id: 'a4a-wordcamp-2026-event-2026-02-17',
				date: {
					from: moment( '2026-04-09' ),
					to: moment( '2026-04-11' ),
				},
				title: translate( 'Join Automattic for Agencies at WordCamp Asia' ),
				subtitle: translate( 'Official sponsor' ),
				descriptions: [
					translate(
						'WordCamp Asia 2026 is happening April 9–11 in Mumbai, India, and our Automattic for Agencies team would love to see you there. If you haven’t already, {{PassLink}}grab your pass for the event{{/PassLink}} and book your stay in one of the {{HotelLink}}official hotel blocks{{/HotelLink}} for the best rates!',
						{
							components: {
								PassLink: (
									<Button
										variant="link"
										href="https://asia.wordcamp.org/2026/event-pass"
										target="_blank"
									/>
								),
								HotelLink: (
									<Button
										variant="link"
										href="https://asia.wordcamp.org/2026/official-hotels/"
										target="_blank"
									/>
								),
							},
						}
					),
				],
				ctas: [
					{
						variant: 'secondary',
						label: translate( 'Register now' ),
						url: 'https://asia.wordcamp.org/2026/',
						trackEventName: 'calypso_a4a_overview_events_a4a_wordcamp_asia_2026_register_click',
						isExternal: true,
					},
				],
				logoUrl: WordCampAsia2026Logo,
				imageUrl: WordCampAsia2026Image,
				imageClassName: 'a4a-event__image--wordcamp-2026',
				dateClassName: 'a4a-event__date--critical',
			},
			...( shouldShowPressablePromoOffer
				? [
						{
							id: 'a4a-pressable-promo-offer-2026-q2',
							date: {
								from: moment( '2026-05-21' ),
								to: moment( '2026-06-30' ),
							},
							title: translate( 'Earn up to 35% cash back on Pressable. Offer ends June 30!' ),
							subtitle: translate( 'Automattic for Agencies & Pressable' ),
							descriptions: [
								translate(
									'Migrate your clients to Pressable and earn up to $50,000 back. Plans starting at 15% back for 12 months, up to 35% for 36 months. {{em}}All deals must be registered through the Automattic for Agencies team to qualify.{{/em}}',
									{
										components: {
											em: <em />,
										},
									}
								),
							],
							ctas: [
								{
									variant: 'primary',
									label: translate( 'Contact sales to claim this offer' ),
									url: 'mailto:partnerships@automattic.com?subject=Pressable%20Summer%202026%20Promo',
									trackEventName:
										'calypso_a4a_overview_events_a4a_pressable_promo_offer_q2_2026_contact_sales_click',
								},
								{
									variant: 'secondary',
									label: translate( 'See full terms' ),
									url: 'https://pressable.com/legal/summer-2026-migration-bonus-terms-and-conditions/',
									isExternal: true,
									trackEventName:
										'calypso_a4a_overview_events_a4a_pressable_promo_offer_q2_2026_see_full_terms_click',
								},
							],
							logoUrl: PressableLogo,
							dateClassName: 'a4a-event__date--a4a',
						},
				  ]
				: [] ),
		];

		return eventsData.filter( ( event ) => {
			const eventDate = event.date.to.clone().startOf( 'day' );
			const today = localizedMoment().startOf( 'day' );
			return eventDate.isSameOrAfter( today );
		} );
	}, [ localizedMoment, shouldShowPressablePromoOffer, translate ] );
};
